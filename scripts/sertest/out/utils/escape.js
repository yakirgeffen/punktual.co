"use strict";
/**
 * Escaping helpers for user-controlled content interpolated into
 * generated embed code (HTML markup and inline script strings).
 *
 * The generated output is pasted by users into their own sites, so any
 * unescaped event title / button text becomes markup or script on a
 * third-party page (studio review finding S2).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeHtml = escapeHtml;
exports.escapeJsString = escapeJsString;
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
/**
 * Escapes a value for inclusion inside a single-quoted JS string literal
 * embedded in generated <script> code. `<` is hex-escaped so a value
 * containing `</script>` cannot terminate the surrounding script block.
 */
function escapeJsString(text) {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/`/g, '\\`')
        .replace(/</g, '\\x3C')
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n');
}
