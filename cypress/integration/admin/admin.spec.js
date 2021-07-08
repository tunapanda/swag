describe('Admin UI without authentication', () => {

    beforeEach(() => {
        cy.visit('/admin')
    })

    it('should be redirected to login', () => {
        cy.url()
            .should('include', '/login');
    });
})

describe('Admin UI after authentication', () => {

    beforeEach(() => {
        cy.login();
        cy.visit('/admin')
    })

    it('links to main dashboard', () => {
        cy.get('a[href="/admin"]')
            .should('be.visible');
    });

    it('links to users management dashboard', () => {
        cy.get('.users-dashboard-menu')
            .should('be.visible')
            .click()
            .siblings()
            .find('a[href="/admin/users"]')
            .should('be.visible');
    });

    it('links to badges management dashboard', () => {
        cy.get('.badges-dashboard-menu')
            .should('be.visible')
            .click()
            .siblings()
            .find('a[href="/admin/badges"]')
            .should('be.visible');
    });

    it('Should show notification bell and count', () => {
        cy.get('.admin-main-header.navbar .notifications-dropdown .nav-link')
            .get('svg')
            .should('be.visible')
            .get('.count')
            .should('be.visible');
    });

    it('Should show notifications popup', () => {
        cy.get('.admin-main-header.navbar .notifications-dropdown .nav-link')
            .click();
        cy.get('.notification-items')
            .find('.notification-item')
            .should('be.visible')
    });

    it('links to survey management page', () => {
        cy.get('a[href="/admin/surveys"]')
            .should('be.visible');
    });
})