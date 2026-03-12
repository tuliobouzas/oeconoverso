function applyHomeJS() {
    // 1. Ultra-Justified FitText for Econopedia Title
    function fitEconopediaTitle() {
        var h2 = document.querySelector('.econopedia-box h2');
        var link = h2 ? h2.querySelector('a') : null;
        if (!link) return;

        var text = link.getAttribute('data-original-text') || link.textContent;
        if (!link.getAttribute('data-original-text')) {
            link.setAttribute('data-original-text', text);
        }

        var words = text.trim().split(/\s+/);
        
        link.innerHTML = '';
        link.style.display = 'flex';
        link.style.flexDirection = 'column';
        link.style.width = '100%';
        link.style.margin = '0';
        link.style.padding = '0';

        words.forEach(function(word) {
            var wordRow = document.createElement('div');
            wordRow.style.display = 'flex';
            wordRow.style.justifyContent = 'space-between';
            wordRow.style.width = '100%';
            wordRow.style.overflow = 'visible'; 
            
            var containerWidth = h2.offsetWidth;
            var fontSize = Math.max(20, Math.min(80, (containerWidth / (word.length * 0.6))));
            wordRow.style.fontSize = fontSize + 'px';
            wordRow.style.lineHeight = '0.95';

            word.split('').forEach(function(char) {
                var charSpan = document.createElement('span');
                charSpan.textContent = char;
                charSpan.style.display = 'inline-block';
                charSpan.style.margin = '0';
                charSpan.style.padding = '0';
                wordRow.appendChild(charSpan);
            });

            link.appendChild(wordRow);
        });
    }

    fitEconopediaTitle();

    var resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(fitEconopediaTitle, 100);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyHomeJS);
} else {
    applyHomeJS();
}
