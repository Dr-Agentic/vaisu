// Theme Switching Test Script
// Run this in the browser console to test theme functionality

function testThemeSwitching() {
    console.log('=== Theme Switching Test ===');

    // Check current theme
    const currentTheme = document.documentElement.getAttribute('data-theme');
    console.log('Current theme:', currentTheme);

    // Test semantic colors
    const colors = [
        '--color-background-primary',
        '--color-text-primary',
        '--color-interactive-primary-base',
        '--color-surface-base'
    ];

    console.log('\n=== Color Values ===');
    colors.forEach(color => {
        const value = getComputedStyle(document.documentElement).getPropertyValue(color).trim();
        console.log(`${color}: ${value || '(empty)'}`);
    });

    // Test theme switching
    console.log('\n=== Testing Theme Switch ===');

    // Switch to light
    document.documentElement.setAttribute('data-theme', 'light');
    setTimeout(() => {
        console.log('Switched to light theme');
        const lightValue = getComputedStyle(document.documentElement).getPropertyValue('--color-background-primary').trim();
        console.log('Background primary (light):', lightValue);

        // Switch to dark
        document.documentElement.setAttribute('data-theme', 'dark');
        setTimeout(() => {
            console.log('Switched to dark theme');
            const darkValue = getComputedStyle(document.documentElement).getPropertyValue('--color-background-primary').trim();
            console.log('Background primary (dark):', darkValue);

            // Restore original
            document.documentElement.setAttribute('data-theme', currentTheme);
            console.log('Restored to:', currentTheme);
        }, 500);
    }, 500);

    // Check theme toggle component
    const themeToggle = document.querySelector('[data-theme-toggle], .theme-toggle, button');
    if (themeToggle) {
        console.log('\n=== Theme Toggle Found ===');
        console.log('Theme toggle element:', themeToggle);
    }

    console.log('\n=== Test Complete ===');
}

// Run the test
testThemeSwitching();