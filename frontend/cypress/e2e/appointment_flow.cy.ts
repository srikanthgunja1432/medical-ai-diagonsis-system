describe('Appointment Booking Flow', () => {
    const patientEmail = 'patient@test.com';
    const patientPassword = 'password123';
    const doctorName = 'Dr. Smith'; // Assuming this doctor exists from seed data or setup

    beforeEach(() => {
        // Reset database or seed data if possible, for now assuming persistent data
        // effectively manually clearing state if needed would be better
    });

    it('should allow a patient to login and book an appointment', () => {
        // 1. Login
        cy.visit('/login');
        cy.get('input[type="email"]').type(patientEmail);
        cy.get('input[type="password"]').type(patientPassword);
        cy.get('button[type="submit"]').click();

        // Verify redirection to dashboard
        cy.url().should('include', '/patient-dashboard');
        cy.contains('Welcome back').should('be.visible');

        // 2. Select a Doctor/Specialist
        // Assuming there's a way to find a doctor, e.g., via search or list
        // Click on "Book Appointment" for a specific doctor
        // For this test, let's assume we search or pick the first one
        cy.contains('Find a Doctor').click(); // Navigate to search if needed, or if it's on dashboard

        // Simulating finding a doctor card and clicking 'Book Appointment'
        // You might need to adjust the selector based on actual UI
        cy.contains(doctorName).parents('.doctor-card').find('button').contains('Book Appointment').click();

        // 3. Appointment Booking Modal
        cy.get('[role="dialog"]').should('be.visible');

        // Select Date (e.g., tomorrow)
        // This part depends heavily on the Calendar component implementation
        // often tricky in E2E. Let's try to pick a date.
        // Assuming simple date picker or list. 
        // If it's a calendar, might need specific logic.
        // checking for available slots

        // Select a time slot
        cy.get('.time-slot').first().click();

        // Enter symptoms
        cy.get('textarea[name="symptoms"]').type('Headache and fever');

        // Confirm Booking
        cy.get('button').contains('Confirm Booking').click();

        // 4. Verify Success
        cy.contains('Appointment booked successfully').should('be.visible');

        // Verify it appears in the dashboard list
        cy.visit('/patient-dashboard');
        cy.contains('Upcoming Appointments').scrollIntoView();
        cy.contains(doctorName).should('be.visible');
    });
});
