// Definir los comandos personalizados
Cypress.Commands.add('dragCandidate', (fromColumn: number, toColumn: number) => {
  cy.get(`[data-testid="stage-column"]`)
    .eq(fromColumn)
    .find('[data-testid="candidate-card"]')
    .first()
    .trigger('mousedown', { button: 0 })
    .trigger('mousemove', { clientX: 400 * (toColumn - fromColumn), clientY: 0 })
    .trigger('mouseup', { force: true });
});

Cypress.Commands.add('verifyCandidateInColumn', (columnIndex: number) => {
  cy.get('[data-testid="stage-column"]')
    .eq(columnIndex)
    .find('[data-testid="candidate-card"]')
    .should('exist');
}); 