describe("Surveys management page", () => {

    function fetchSurveys() {
        return cy.surveys();
    }

    function fetchTriggers() {
        return cy.triggers();
    }

    function hasExpired(expiryDate) {
        return new Date(expiryDate) < new Date();
    }


    beforeEach(() => {
        cy.login();
        cy.visit('/admin/surveys');
    })

    it('should display create survey card-button', () => {
        cy.get('.surveys-list .create-card')
            .should('be.visible')
    });

    it('should display survey creation form', () => {
        cy.get('.surveys-list .create-card')
            .click()
            .get('.survey-form-section .survey-form form')
            .scrollIntoView()
            .within(() => {

                cy.get('select.trigger-select')
                    .should('be.visible');
                cy.get('input.name-input')
                    .should('be.visible');
                cy.get('input.expiry-input')
                    .should('be.visible');
                cy.get('input.frequency-input')
                    .should('be.visible');
                cy.get('input.embed-input')
                    .should('be.visible');
                cy.get('textarea.description-input')
                    .should('be.visible');


            });
    });

    it('should create a survey', () => {
        const survey = {
            name: 'Tell us more about your experience',
            description: 'Test description',
            expiry: `${new Date().getFullYear() + 1}-10-21`,
            frequency: 10,
            embed: '<iframe src="admin.spec.js"> </iframe>'
        }

        cy.get('.surveys-list .create-card')
            .click()
            .get('.survey-form-section .survey-form form')
            .scrollIntoView()
            .within(() => {

                fetchTriggers()
                    .then((triggers) => {
                        cy.get('select.trigger-select')
                            .select(triggers[0].id)
                    });

                cy.get('input.name-input')
                    .type(survey.name);
                cy.get('input.expiry-input')
                    .type(survey.expiry);
                cy.get('input.frequency-input')
                    .type(survey.frequency);
                cy.get('input.embed-input')
                    .type(survey.embed);
                cy.get('textarea.description-input')
                    .type(survey.description);

                cy.get('button.btn-submit')
                    .click();

            });

        cy.get('.surveys-list')
            .contains('.name', survey.name, { matchCase: false, timeout: 4000 })
            .siblings()
            .contains('.description', survey.description, { matchCase: false })

    });

    it('should not create a survey with invalid data', () => {

        const survey = {
            name: 'Tell us more about your experience',
            description: 'Test description',
            expiry: `${new Date().getFullYear() - 1}-10-21`,
            frequency: -10,
            embed: '<iframe src="admin.spec.js"> </iframe>'
        }

        cy.get('.surveys-list .create-card')
            .click()
            .get('.survey-form-section .survey-form form')
            .scrollIntoView()
            .within(() => {

                fetchTriggers()
                    .then((triggers) => {
                        cy.get('select.trigger-select')
                            .select(triggers[0].id)
                    });

                cy.get('input.name-input')
                    .type(survey.name);
                cy.get('input.expiry-input')
                    .type(survey.expiry);
                cy.get('input.frequency-input')
                    .type(survey.frequency);
                cy.get('input.embed-input')
                    .type(survey.embed);
                cy.get('textarea.description-input')
                    .type(survey.description);

                cy.get('button.btn-submit')
                    .click();

            });

        cy.get('.surveys-list .survey-card')
            .find('.name')
            .should('not.contain', survey.name)

    });

    it('should display available survey', () => {
        fetchSurveys()
            .then((surveys) => {
                const selectedSurvey = surveys[Math.floor(Math.random() * surveys.length)];

                cy.get(`.surveys-list .survey-card#survey-card-${selectedSurvey.id}`)
                    .contains(selectedSurvey.name.substr(0, 25), { matchCase: false })
            })
    });

    it('should edit a survey', () => {
        const updatedSurvey = {
            name: 'Tell us more about your experience',
            description: 'Test description',
            expiry: `${new Date().getFullYear() + 1}-10-21`,
            frequency: 10,
            embed: '<iframe src="admin.spec.js"> </iframe>'
        }
        fetchSurveys()
            .then((surveys) => {
                const selectedSurvey = surveys[Math.floor(Math.random() * surveys.length)];

                cy.get(`.surveys-list .survey-card#survey-card-${selectedSurvey.id} .footer .dd-actions-menu`)
                    .find('.dropdown-toggle')
                    .click()
                    .siblings()
                    .focus("dropdown-menu")
                    .find('button.btn-edit')
                    .click();

                cy.get('.survey-form-section .survey-form form')
                    .scrollIntoView()
                    .should('be.visible')
                    .within(() => {

                        fetchTriggers()
                            .then((triggers) => {
                                cy.get('select.trigger-select')
                                    .select(triggers[0].id)
                            });

                        cy.get('input.name-input')
                            .clear()
                            .type(updatedSurvey.name);
                        cy.get('input.expiry-input')
                            .clear()
                            .type(updatedSurvey.expiry);
                        cy.get('input.frequency-input')
                            .clear()
                            .type(updatedSurvey.frequency);
                        cy.get('input.embed-input')
                            .clear()
                            .type(updatedSurvey.embed);
                        cy.get('textarea.description-input')
                            .clear()
                            .type(updatedSurvey.description);

                        cy.get('button.btn-submit')
                            .click();
                    });

                // evaluate the changes
                cy.get(`.surveys-list .survey-card#survey-card-${selectedSurvey.id}`)
                    .contains('.name', updatedSurvey.name, { matchCase: false })
            })
    })

    it('should modify survey statuses', () => {
        const surveyStatus = {
            published: 'Active',
            unpublished: 'Pending',
            archived: 'Archived',
        };

        fetchSurveys()
            .then((surveys) => {
                const activeSurvey = surveys.find((s) => s.status === surveyStatus.published && !hasExpired(s.expiry));
                const pendingSurvey = surveys.find((s) => s.status === surveyStatus.unpublished && !hasExpired(s.expiry));
                const archivedSurvey = surveys.find((s) => s.status === surveyStatus.archived && !hasExpired(s.expiry));

                if (activeSurvey) {
                    cy.get(`.surveys-list .survey-card#survey-card-${activeSurvey.id} .footer .dd-actions-menu`)
                        .find('.dropdown-toggle')
                        .focus()
                        .click()
                        .siblings()
                        .focus("dropdown-menu")
                        .find('button.btn-unpublish')
                        .click();


                    cy.get(`.surveys-list .survey-card#survey-card-${activeSurvey.id}`)
                        .contains('.status .status-badge', surveyStatus.unpublished)
                        .get(`.surveys-list .survey-card#survey-card-${activeSurvey.id}`)
                        .find('.dropdown-toggle')
                        .focus()
                        .click()
                        .siblings()
                        .focus("dropdown-menu")
                        .get('button.btn-publish')
                        .should('exist')

                }

                if (pendingSurvey) {
                    cy.get(`.surveys-list .survey-card#survey-card-${pendingSurvey.id} .footer .dd-actions-menu`)
                        .find('.dropdown-toggle')
                        .focus()
                        .click()
                        .siblings()
                        .focus("dropdown-menu")
                        .find('button.btn-publish')
                        .click();


                    cy.get(`.surveys-list .survey-card#survey-card-${pendingSurvey.id}`)
                        .contains('.status .status-badge', surveyStatus.published)
                        .get(`.surveys-list .survey-card#survey-card-${pendingSurvey.id}`)
                        .find('.dropdown-toggle')
                        .click()
                        .siblings()
                        .focus("dropdown-menu")
                        .get('button.btn-unpublish')
                        .should('exist')
                }

                if (archivedSurvey) {
                    cy.get(`.surveys-list .survey-card#survey-card-${archivedSurvey.id} .footer .dd-actions-menu`)
                        .find('.dropdown-toggle')
                        .focus()
                        .click()
                        .siblings()
                        .focus("dropdown-menu")
                        .find('button.btn-publish')
                        .click();

                    cy.get(`.surveys-list .survey-card#survey-card-${archivedSurvey.id}`)
                        .contains('.status .status-badge', surveyStatus.published)
                        .get(`.surveys-list .survey-card#survey-card-${archivedSurvey.id}`)
                        .find('.dropdown-toggle')
                        .focus()
                        .click()
                        .siblings()
                        .focus("dropdown-menu")
                        .get('button.btn-archive')
                        .should('exist')
                }

            })

    })

    it('should delete a survey', () => {
        fetchSurveys()
            .then((surveys) => {
                const selectedSurvey = surveys[Math.floor(Math.random() * surveys.length)];

                cy.get(`.surveys-list .survey-card#survey-card-${selectedSurvey.id} .footer .dd-actions-menu`)
                    .find('.dropdown-toggle')
                    .click()
                    .siblings()
                    .focus("dropdown-menu")
                    .find('button.btn-delete')
                    .click();

                cy.get(`.surveys-list .survey-card#survey-card-${selectedSurvey.id}`)
                    .should('not.exist')
            })

    })
})