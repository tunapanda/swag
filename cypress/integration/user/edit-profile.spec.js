describe('Edit User Profile', () => {
    beforeEach(() => {
        cy.login();
        cy.visit('/profile/edit');
    });

    /**
     *
     * @param filename fixture filename
     * @param mimeType e.g. 'image/jpg'
     * @returns {Cypress.Chainable<unknown>}
     */
    function selectUploadFile(filename, mimeType) {
        return cy.fixture(filename, 'binary')
            .then((img) => {
                const blob = Cypress.Blob.binaryStringToBlob(img, mimeType);

                const file = new File([blob], filename, {type: mimeType});
                const list = new DataTransfer();
                list.items.add(file);
                return list.files;
            })
            .then((files) => {
                cy.get('.upload-file-input')
                    .then((input) => {
                        input[0].files = files;
                    })
                    .trigger('change', {force: true})
            })
    }

    function getDummyAccount(valid = true) {
        if (valid === false) {
            return {
                firstname: 'J',
                lastname: 'D',
                email: 'invalieemail@com',
                phone: '+254413-000',
                bio: new Array(14).fill('This is a demo.').join(' '),
                location: 'Nairobi,Kenya',
                gender: Math.floor(Math.random() * 3)
            }
        }
        return {
            firstname: 'Jane',
            lastname: 'Doe',
            email: 'valid@email.com',
            phone: '+254-713-413-000',
            bio: 'This is a little about me',
            location: 'Nairobi,Kenya',
            gender: Math.floor(Math.random() * 3)
        }
    }

    it('Should see edit profile form', () => {
        cy.get('.edit-profile-form')
            .should('exist');
    });

    it('Should edit user profile', () => {
        const profile = getDummyAccount(true);
        cy.get('.edit-profile-form')
            .within(() => {
                cy.get('.firstname-input')
                    .clear()
                    .type(profile.firstname);

                cy.get('.lastname-input')
                    .clear()
                    .type(profile.lastname);

                cy.get('.contact-number-input')
                    .clear()
                    .type(profile.phone);

                cy.get('.email-input')
                    .clear()
                    .type(profile.email);


                selectUploadFile('test.jpg', 'image/jpg');

                cy.get('.about-input')
                    .clear()
                    .type(profile.bio, {delay: 0});

                cy.get('.location-input')
                    .clear()
                    .type(profile.location);

                cy.get('[type="radio"]')
                    .eq(profile.gender)
                    .check();

                cy.get('.btn-submit')
                    .click();
            });

        cy.get('.ember-notify.ember-notify-show.alert-success .message')
            .should('be.visible');
    });

    it('Should update user profile with invalid data', () => {
        const profile = getDummyAccount(false);
        cy.get('.edit-profile-form')
            .within(() => {
                cy.get('.firstname-input')
                    .clear()
                    .type(profile.firstname);

                cy.get('.lastname-input')
                    .clear()
                    .type(profile.lastname);

                cy.get('.contact-number-input')
                    .clear()
                    .type(profile.phone);

                cy.get('.email-input')
                    .clear()
                    .type(profile.email);


                selectUploadFile('user.json', 'application/json');

                cy.get('.about-input', {delay: 0})
                    .clear()
                    .type(profile.bio);

                cy.get('.location-input')
                    .clear()
                    .type(profile.location);

                cy.get('[type="radio"]')
                    .eq(profile.gender)
                    .check()

                cy.get('.btn-submit')
                    .click();

                cy.get('.contact-number-input')
                    .siblings('.invalid-feedback')
                    .should('be.visible');

                cy.get('.about-input')
                    .siblings('.invalid-feedback')
                    .should('be.visible');

                cy.get('.email-input')
                    .siblings('.invalid-feedback')
                    .should('be.visible');

            });

        cy.get('.ember-notify.ember-notify-show.alert-success')
            .should('not.exist');
    });


})