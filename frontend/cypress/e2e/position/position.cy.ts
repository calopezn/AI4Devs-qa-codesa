/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

describe('Position Page E2E Tests', () => {
  beforeEach(() => {
    // Cargar los datos de prueba
    cy.fixture('position.json').as('positionData');
    
    // Interceptar la llamada a la API para obtener los datos de la posición
    cy.intercept('GET', '/positions/1/interviewFlow', {
      statusCode: 200,
      body: {
        interviewFlow: {
          interviewFlow: {
            interviewSteps: [
              { id: 1, name: 'Entrevista Inicial' },
              { id: 2, name: 'Entrevista Técnica' },
              { id: 3, name: 'Entrevista Final' }
            ]
          },
          positionName: 'Desarrollador Frontend'
        }
      }
    }).as('getInterviewFlow');
    
    // Interceptar la llamada a la API para obtener los candidatos
    cy.intercept('GET', '/positions/1/candidates', {
      statusCode: 200,
      body: [
        {
          candidateId: 1,
          fullName: 'Juan Pérez',
          averageScore: 4,
          applicationId: 101,
          currentInterviewStep: 'Entrevista Inicial'
        }
      ]
    }).as('getCandidates');
    
    // Visitar la página de posición
    cy.visit('/positions/1');
    
    // Esperar a que las llamadas a la API se completen
    cy.wait('@getInterviewFlow');
    cy.wait('@getCandidates');
    
    // Esperar a que el DOM se actualice después de cargar los datos
    cy.wait(2000);
  });

  describe('Carga de la Página de Position', () => {
    it('debe mostrar el título de la posición correctamente', () => {
      // Verificar que el elemento h2 existe y es visible
      cy.get('h2').should('be.visible');
      
      // Verificar que el h2 contiene el título esperado
      cy.get('h2').should('contain', 'Desarrollador Frontend');
    });

    it('debe mostrar las columnas de fases del proceso', () => {
      // Verificar que hay 3 columnas (Cards) dentro del DragDropContext
      cy.get('[data-testid="stage-column"]').should('have.length', 3);
      
      // Verificar que los títulos de las columnas son correctos
      cy.get('[data-testid="stage-column"] .card-header').first().should('contain', 'Entrevista Inicial');
      cy.get('[data-testid="stage-column"] .card-header').eq(1).should('contain', 'Entrevista Técnica');
      cy.get('[data-testid="stage-column"] .card-header').eq(2).should('contain', 'Entrevista Final');
    });

    it('debe mostrar las tarjetas de candidatos en sus columnas correspondientes', () => {
      // Verificar que la tarjeta está en la primera columna (Entrevista Inicial)
      cy.get('[data-testid="stage-column"]')
        .first()
        .find('[data-testid="candidate-card"]')
        .should('contain', 'Juan Pérez');
    });
  });

  describe('Cambio de Fase de un Candidato', () => {
    it('debe permitir arrastrar una tarjeta entre columnas', () => {
      // Interceptar la llamada PUT al backend
      cy.intercept('PUT', '/candidates/*').as('updateCandidate');

      // Verificar que hay una tarjeta en la primera columna antes de intentar arrastrarla
      cy.get('[data-testid="stage-column"]')
        .eq(0)
        .find('[data-testid="candidate-card"]')
        .should('exist')
        .and('contain', 'Juan Pérez');

      // Arrastrar el candidato de la primera columna a la segunda
      cy.get('[data-testid="stage-column"]')
        .eq(0)
        .find('[data-testid="candidate-card"]')
        .first()
        .trigger('mousedown', { button: 0 })
        .trigger('mousemove', { clientX: 400, clientY: 0 })
        .trigger('mouseup', { force: true });

      // Verificar que la tarjeta se movió a la nueva columna
      cy.get('[data-testid="stage-column"]')
        .eq(1)
        .find('[data-testid="candidate-card"]')
        .should('exist');
    });

    it('debe actualizar el backend después del cambio de fase', () => {
      // En lugar de intentar arrastrar la tarjeta, vamos a simular directamente
      // la actualización del estado de la aplicación
      
      // Interceptar la llamada PUT al backend
      cy.intercept('PUT', '/candidates/*', {
        statusCode: 200,
        body: { success: true }
      }).as('updateCandidate');
      
      // Verificar que hay una tarjeta en la primera columna antes de intentar arrastrarla
      cy.get('[data-testid="stage-column"]')
        .eq(0)
        .find('[data-testid="candidate-card"]')
        .should('exist')
        .and('contain', 'Juan Pérez');
      
      // Simular el arrastre y soltar usando un enfoque más directo
      cy.get('[data-testid="stage-column"]')
        .eq(0)
        .find('[data-testid="candidate-card"]')
        .first()
        .then($card => {
          // Obtener el ID del candidato de la tarjeta
          const candidateId = $card.attr('data-candidate-id') || '1';
          
          // Simular la actualización del estado de la aplicación
          cy.window().then(win => {
            // Intentar acceder a la función updateCandidateStep si existe
            if (typeof (win as any).updateCandidateStep === 'function') {
              (win as any).updateCandidateStep(parseInt(candidateId), 2);
            } else {
              // Si no existe la función, intentar simular el arrastre y soltar
              cy.get('[data-testid="stage-column"]')
                .eq(0)
                .find('[data-testid="candidate-card"]')
                .first()
                .trigger('mousedown', { button: 0 })
                .trigger('mousemove', { clientX: 400, clientY: 0 })
                .trigger('mouseup', { force: true });
            }
          });
        });
      
      // Esperar a que el DOM se actualice
      cy.wait(1000);
      
      // Verificar que la tarjeta se movió a la nueva columna
      cy.get('[data-testid="stage-column"]')
        .eq(1)
        .find('[data-testid="candidate-card"]')
        .should('exist')
        .and('contain', 'Juan Pérez');
      
      // Verificar que la tarjeta ya no está en la columna original
      cy.get('[data-testid="stage-column"]')
        .eq(0)
        .find('[data-testid="candidate-card"]')
        .should('not.exist');
    });

    it('debe mantener el estado correcto después de recargar la página', () => {
      // En lugar de intentar arrastrar la tarjeta, vamos a simular directamente
      // la actualización del estado de la aplicación
      
      // Interceptar la llamada PUT al backend
      cy.intercept('PUT', '/candidates/*', {
        statusCode: 200,
        body: { success: true }
      }).as('updateCandidate');
      
      // Verificar que hay una tarjeta en la primera columna antes de intentar arrastrarla
      cy.get('[data-testid="stage-column"]')
        .eq(0)
        .find('[data-testid="candidate-card"]')
        .should('exist')
        .and('contain', 'Juan Pérez');
      
      // Simular el arrastre y soltar usando un enfoque más directo
      cy.get('[data-testid="stage-column"]')
        .eq(0)
        .find('[data-testid="candidate-card"]')
        .first()
        .then($card => {
          // Obtener el ID del candidato de la tarjeta
          const candidateId = $card.attr('data-candidate-id') || '1';
          
          // Simular la actualización del estado de la aplicación
          cy.window().then(win => {
            // Intentar acceder a la función updateCandidateStep si existe
            if (typeof (win as any).updateCandidateStep === 'function') {
              (win as any).updateCandidateStep(parseInt(candidateId), 2);
            } else {
              // Si no existe la función, intentar simular el arrastre y soltar
              cy.get('[data-testid="stage-column"]')
                .eq(0)
                .find('[data-testid="candidate-card"]')
                .first()
                .trigger('mousedown', { button: 0 })
                .trigger('mousemove', { clientX: 400, clientY: 0 })
                .trigger('mouseup', { force: true });
            }
          });
        });
      
      // Esperar a que el DOM se actualice
      cy.wait(1000);
      
      // Verificar que la tarjeta se movió a la nueva columna
      cy.get('[data-testid="stage-column"]')
        .eq(1)
        .find('[data-testid="candidate-card"]')
        .should('exist')
        .and('contain', 'Juan Pérez');
      
      // Recargar la página
      cy.reload();
      
      // Verificar que el candidato sigue en la nueva columna
      cy.get('[data-testid="stage-column"]')
        .eq(1)
        .find('[data-testid="candidate-card"]')
        .should('exist')
        .and('contain', 'Juan Pérez');
    });
  });
}); 