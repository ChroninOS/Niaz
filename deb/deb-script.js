document.addEventListener('DOMContentLoaded', function() {
    
    /* --- Tab Logic --- */
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            // Show corresponding content
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    /* --- Copy to Clipboard Logic --- */
    const copyBtns = document.querySelectorAll('.copy-btn');

    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Find the <code> element inside the same code-block
            // The structure is .code-block > .code-header + pre > code
            const codeBlock = btn.closest('.code-block');
            const codeText = codeBlock.querySelector('code').innerText;

            // Copy to clipboard API
            navigator.clipboard.writeText(codeText).then(() => {
                // Feedback animation
                const originalText = btn.innerHTML;
                
                btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                btn.style.borderColor = '#16A085';
                btn.style.color = '#16A085';

                // Revert back after 2 seconds
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.borderColor = '';
                    btn.style.color = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
    });
});