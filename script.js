// script.js

// Funzione per gestire il menu di navigazione su dispositivi mobili
function toggleMenu() {
    const nav = document.querySelector('nav ul');
    nav.classList.toggle('show');
}

// Aggiungi un listener per il clic sul pulsante del menu (per dispositivi mobili)
document.querySelector('.menu-toggle').addEventListener('click', toggleMenu);

// Funzione per gestire l'invio del modulo di contatto
document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Previene l'invio del modulo

    // Ottieni i valori dei campi del modulo
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Valida i campi (puoi aggiungere ulteriori validazioni se necessario)
    if (name && email && message) {
        // Simula l'invio del modulo (qui puoi integrare con un servizio di backend o API)
        alert('Grazie per averci contattato, ' + name + '! Ti risponderemo al più presto.');
        // Resetta il modulo dopo l'invio
        document.getElementById('contact-form').reset();
    } else {
        alert('Per favore, compila tutti i campi del modulo.');
    }
});
