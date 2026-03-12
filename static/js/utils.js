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
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyUtils);
} else {
    applyUtils();
}
