/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Arrastra un candidato de una columna a otra
     * @example
     * cy.dragCandidate(0, 1)
     */
    dragCandidate(fromColumn: number, toColumn: number): Chainable<void>
    
    /**
     * Verifica que un candidato existe en una columna específica
     * @example
     * cy.verifyCandidateInColumn(1)
     */
    verifyCandidateInColumn(columnIndex: number): Chainable<void>
  }
} 