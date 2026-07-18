// tests/e2e/helpers/auth.js
// Shared auth helpers for all test suites

export const TEST_USER = {
  email: 'admin@medicore.in',
  password: 'Admin@123',
  name: 'System Admin',
  role: 'ADMIN',
};

export const API_BASE = 'http://127.0.0.1:5000/api';

/**
 * Register a fresh test user via API (if not already existing).
 * Returns the created/existing user + tokens.
 * Retries up to 3 times on transient server errors (5xx).
 */
export async function ensureTestUser(request) {
  // Try to login first
  const loginRes = await request.post(`${API_BASE}/auth/login`, {
    data: { email: TEST_USER.email, password: TEST_USER.password },
  });
  let token = '';
  if (loginRes.ok()) {
    const body = await loginRes.json();
    token = body.data.accessToken;
  } else {
    // Register if login failed - retry on transient 5xx errors
    let regRes;
    for (let attempt = 1; attempt <= 4; attempt++) {
      regRes = await request.post(`${API_BASE}/auth/register`, {
        data: {
          name: TEST_USER.name,
          email: TEST_USER.email,
          password: TEST_USER.password,
          role: TEST_USER.role,
        },
      });
      if (regRes.ok()) break;
      const status = regRes.status();
      // 409 = already exists (treat as ok, just login)
      if (status === 409) break;
      // For transient server errors, wait and retry
      if (status >= 500 && attempt < 4) {
        console.warn(`Register attempt ${attempt} failed with ${status}, retrying in ${attempt * 2}s...`);
        await new Promise(r => setTimeout(r, attempt * 2000));
        // Also try login between retries (may have succeeded but errored on notification)
        const retryLogin = await request.post(`${API_BASE}/auth/login`, {
          data: { email: TEST_USER.email, password: TEST_USER.password },
        });
        if (retryLogin.ok()) {
          const body = await retryLogin.json();
          token = body.data.accessToken;
          break;
        }
        continue;
      }
      if (!regRes.ok() && status !== 409) {
        const body = await regRes.json().catch(() => ({ message: `HTTP ${status}` }));
        throw new Error(`Could not create test user: ${body.message}`);
      }
    }

    if (!token) {
      // Now login after successful registration
      const loginRes2 = await request.post(`${API_BASE}/auth/login`, {
        data: { email: TEST_USER.email, password: TEST_USER.password },
      });
      const body = await loginRes2.json();
      token = body.data.accessToken;
    }
  }

  // Seed DB with 1 Dept, 1 Doctor, 1 Patient so UI tests don't fail on empty DB
  const dRes = await request.post(`${API_BASE}/departments`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { name: 'Cardiology', description: 'Heart care', headOfDepartment: 'Dr. John', totalBeds: 20 },
  });
  const dept = await dRes.json();
  let deptId = dept?.data?.department?.id;
  if (!deptId) {
    const r = await request.get(`${API_BASE}/departments`, { headers: { Authorization: `Bearer ${token}` } });
    const j = await r.json();
    deptId = j.data?.departments?.[0]?.id;
  }
  
  const pRes = await request.post(`${API_BASE}/patients`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { name: 'Test Patient', email: 'testpat@hms.com', dateOfBirth: '1990-01-01', gender: 'MALE', phone: '12345', address: '123 Test St', bloodGroup: 'O+', emergencyContact: '111', medicalHistory: 'None' },
  });
  const pat = await pRes.json();
  let patId = pat?.data?.patient?.id;
  if (!patId) {
    const r = await request.get(`${API_BASE}/patients?limit=1`, { headers: { Authorization: `Bearer ${token}` } });
    const j = await r.json();
    patId = j.data?.patients?.[0]?.id;
  }

  // We need a non-doctor user to link to the new doctor
  const uRes = await request.post(`${API_BASE}/auth/register`, {
    data: { name: 'Seed Doctor', email: 'seed.doc@hms.test', password: 'password123', role: 'DOCTOR' },
  });
  const user = await uRes.json();
  let userId = user?.data?.user?.id;
  if (!userId) {
    const r = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'seed.doc@hms.test', password: 'password123' },
    });
    const j = await r.json();
    userId = j?.data?.user?.id;
  }

  if (userId && deptId) {
    const docRes = await request.post(`${API_BASE}/doctors`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { userId, departmentId: deptId, specialization: 'Cardiology', qualifications: 'MD', experienceYears: 10, consultationFee: 500, availableDays: ['MONDAY'], startTime: '09:00', endTime: '17:00' }
    });
    const doc = await docRes.json();
    let docId = doc?.data?.doctor?.id;
    if (!docId) {
      const r = await request.get(`${API_BASE}/doctors?limit=1`, { headers: { Authorization: `Bearer ${token}` } });
      const j = await r.json();
      docId = j.data?.doctors?.[0]?.id;
    }
    
    if (patId && docId) {
      console.log('Seeding Appointment with patId:', patId, 'docId:', docId);
      const apptRes = await request.post(`${API_BASE}/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { patientId: patId, doctorId: docId, type: 'CONSULTATION', status: 'SCHEDULED', scheduledAt: new Date().toISOString(), reason: 'Checkup' }
      });
      if (!apptRes.ok()) console.error('Failed to seed appointment:', await apptRes.text());
      
      console.log('Seeding Invoice with patId:', patId);
      // Seed an Invoice so Billing tests pass
      const invRes = await request.post(`${API_BASE}/billing`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { patientId: patId, dueAt: new Date().toISOString(), status: 'PENDING', items: [{ description: 'Consultation', quantity: 1, unitPrice: 500, total: 500 }] }
      });
      if (!invRes.ok()) console.error('Failed to seed invoice:', await invRes.text());
    } else {
      console.log('Skipped seeding appt/invoice. patId:', patId, 'docId:', docId);
    }
  }

  return { accessToken: token };
}

/**
 * Perform UI login on the page and wait for dashboard.
 */
export async function loginUI(page, email = TEST_USER.email, password = TEST_USER.password) {
  await page.goto('/');
  // If already on dashboard, skip
  if (page.url().includes('localhost:5173') && !await page.locator('[id="login-email"]').isVisible({ timeout: 1000 }).catch(() => false)) {
    return;
  }
  await page.locator('[id="login-email"], input[type="email"]').first().fill(email);
  await page.locator('[id="login-password"], input[type="password"]').first().fill(password);
  await page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first().click();
  await page.waitForURL('**/');
  await page.waitForSelector('.stat-grid, .dashboard, h2:has-text("Dashboard")', { timeout: 15000 });
}
