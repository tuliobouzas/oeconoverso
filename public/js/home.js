function applyHomeJS() {

    // 1. SMALL CAPS SCRIPT: Detects natural lines and creates rows
    function applySmallCaps(containerSelector) {
        var h2 = document.querySelector(containerSelector);
        var link = h2 ? h2.querySelector('a') : null;
        if (!link) return;

        var text = link.getAttribute('data-original-text') || link.textContent;
        if (!link.getAttribute('data-original-text')) {
            link.setAttribute('data-original-text', text);
        }

        var words = text.trim().split(/\s+/);
        
        // Step A: Detect natural lines using temporary spans
        link.innerHTML = '';
        words.forEach(function(word) {
            var span = document.createElement('span');
            span.textContent = word + ' ';
            link.appendChild(span);
        });

        var lines = [];
        var currentLine = [];
        var lastTop = -1;
        var spans = link.querySelectorAll('span');
        
        spans.forEach(function(span) {
            var top = span.offsetTop;
            if (lastTop !== -1 && top > lastTop + 5) { // 5px threshold for new line
                lines.push(currentLine);
                currentLine = [];
            }
            currentLine.push(span.textContent.trim());
            lastTop = top;
        });
        if (currentLine.length > 0) lines.push(currentLine);

        // Step B: Build the rows based on detected lines
        link.innerHTML = '';
        link.style.display = 'flex';
        link.style.flexDirection = 'column';
        link.style.gap = '0';
        link.style.textTransform = 'uppercase';

        lines.forEach(function(lineWords) {
            var lineRow = document.createElement('div');
            lineRow.className = 'small-caps-row';
            lineRow.style.display = 'block';
            lineRow.style.width = 'fit-content';
            lineRow.style.whiteSpace = 'nowrap';
            lineRow.style.lineHeight = '0.9';

            lineWords.forEach(function(word, wIdx) {
                var wordSpan = document.createElement('span');
                wordSpan.style.display = 'inline-block';
                word.split('').forEach(function(char, cIdx) {
                    var charSpan = document.createElement('span');
                    charSpan.textContent = char;
                    if (cIdx === 0) charSpan.style.fontSize = '1.3em';
                    wordSpan.appendChild(charSpan);
                });
                lineRow.appendChild(wordSpan);
                if (wIdx < lineWords.length - 1) {
                    lineRow.appendChild(document.createTextNode(' '));
                }
            });
            link.appendChild(lineRow);
        });
    }

    // 2. FONT-SIZE FITTING SCRIPT: Scales each row's font size to fill the width
    function fitLinesByFontSize(containerSelector) {
        var container = document.querySelector(containerSelector);
        var link = container ? container.querySelector('a') : null;
        if (!link) return;
        
        var rows = link.querySelectorAll('.small-caps-row');
        var containerWidth = container.clientWidth * 0.95;

        rows.forEach(function(row) {
            row.style.fontSize = ''; // Reset to base for measurement
            var rowWidth = row.offsetWidth;
            if (rowWidth > 0) {
                var ratio = containerWidth / rowWidth;
                var currentFS = parseFloat(window.getComputedStyle(row).fontSize);
                row.style.fontSize = (currentFS * ratio) + 'px';
            }
        });
    }

    function initEconopediaStyling() {
        applySmallCaps('.econopedia-box h2');
        fitLinesByFontSize('.econopedia-box h2');
    }

    initEconopediaStyling();

    var resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(initEconopediaStyling, 100);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(applyHomeJS);
        } else {
            window.addEventListener('load', applyHomeJS);
        }
    });
} else {
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(applyHomeJS);
    } else {
        applyHomeJS();
    }
}
