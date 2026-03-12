function applyUtils() {
    // 1. Hide summary gradient
    document.querySelectorAll('.summary-wrapper').forEach(function(wrapper) {
        var info = wrapper.querySelector('.info');
        if (info && info.scrollHeight <= wrapper.clientHeight + 5) {
            var gradient = wrapper.querySelector('.summary-gradient');
            if (gradient) {
                gradient.style.display = 'none';
            }
        }
    });

    // 2. Drop cap
    document.querySelectorAll('.article-content > p:first-of-type, .manchete .info > p:first-of-type').forEach(function(p) {
        var html = p.innerHTML;
        var firstCharMatch = html.match(/^\s*([^<])/);
        if (firstCharMatch && !html.trim().startsWith('<')) {
            var firstChar = firstCharMatch[1];
            var charIndex = html.indexOf(firstChar);
            p.innerHTML = html.slice(0, charIndex) + 
                          '<span class="drop-cap">' + firstChar + '</span>' + 
                          html.slice(charIndex + 1);
        }
    });

    // 3. Ultra-Justified FitText for Econopedia Title
    function fitEconopediaTitle() {
        var h2 = document.querySelector('.econopedia-box h2');
        var link = h2 ? h2.querySelector('a') : null;
        if (!link) return;

        var text = link.getAttribute('data-original-text') || link.textContent;
        if (!link.getAttribute('data-original-text')) {
            link.setAttribute('data-original-text', text);
        }

        var words = text.trim().split(/\s+/);
        // We use 100% of the H2 width, which is synced with .info via CSS
        
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
            wordRow.style.overflow = 'visible'; // Ensure no letters are clipped
            
            // Calculate a safe font size that allows the word to be justified
            // (The word must naturally be shorter than the container for space-between to work)
            var containerWidth = h2.offsetWidth;
            var fontSize = Math.max(20, Math.min(80, (containerWidth / (word.length * 0.6))));
            wordRow.style.fontSize = fontSize + 'px';
            wordRow.style.lineHeight = '0.95';

            word.split('').forEach(function(char, index) {
                var charSpan = document.createElement('span');
                charSpan.textContent = char;
                charSpan.style.display = 'inline-block';
                // Optical adjustment: remove any potential default margins
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
    document.addEventListener('DOMContentLoaded', applyUtils);
} else {
    applyUtils();
}
