document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('verification-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const phoneError = document.getElementById('phone-error');
    
    const globalError = document.getElementById('global-error');
    const globalErrorText = document.getElementById('global-error-text');
    
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    // API Endpoint Configuration - relative for web server hosting/deployment, fallback to local URL if opened as static file
    const API_URL = window.location.protocol.startsWith('http')
        ? '/api/validate-user'
        : 'http://127.0.0.1:8000/api/validate-user';

    // Regex for basic syntactical email verification
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Helper functions for inline styling & error message setting
    function setError(input, errorSpan, message) {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        errorSpan.textContent = message;
        errorSpan.classList.add('visible');
        return false;
    }

    function setSuccess(input, errorSpan) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        errorSpan.textContent = '';
        errorSpan.classList.remove('visible');
        return true;
    }

    // Input Validation Logic
    function validateName() {
        const value = nameInput.value.trim();
        if (value.length === 0) {
            return setError(nameInput, nameError, 'Name is required.');
        }
        return setSuccess(nameInput, nameError);
    }

    function validateEmail() {
        const value = emailInput.value.trim();
        if (value.length === 0) {
            return setError(emailInput, emailError, 'Email address is required.');
        }
        if (!EMAIL_REGEX.test(value)) {
            return setError(emailInput, emailError, 'Must be a syntactically valid email.');
        }
        return setSuccess(emailInput, emailError);
    }

    function validatePhone() {
        const value = phoneInput.value.trim();
        if (value.length === 0) {
            return setError(phoneInput, phoneError, 'Phone number is required.');
        }
        if (value.length !== 10 || !/^\d+$/.test(value)) {
            return setError(phoneInput, phoneError, 'Phone number must be exactly 10 digits.');
        }
        return setSuccess(phoneInput, phoneError);
    }

    // Attach real-time input validation listeners
    nameInput.addEventListener('input', validateName);
    emailInput.addEventListener('input', validateEmail);
    phoneInput.addEventListener('input', validatePhone);

    // Form submission handler
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Trigger validation checks
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isPhoneValid = validatePhone();

        // Stop submit if form has errors
        if (!isNameValid || !isEmailValid || !isPhoneValid) {
            // Focus on the first error input
            if (!isNameValid) nameInput.focus();
            else if (!isEmailValid) emailInput.focus();
            else if (!isPhoneValid) phoneInput.focus();
            return;
        }

        // Disable button & show spinner loading state
        submitBtn.disabled = true;
        btnText.style.opacity = '0.3';
        btnLoader.classList.remove('hidden');
        globalError.classList.add('hidden');

        const requestData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim()
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            if (response.ok) {
                // HTTP 200: Redirect with status
                const nameParam = encodeURIComponent(requestData.name);
                if (data.valid) {
                    window.location.href = `result.html?valid=true&name=${nameParam}`;
                } else {
                    const messageParam = encodeURIComponent(data.message || 'Invalid user details');
                    window.location.href = `result.html?valid=false&message=${messageParam}`;
                }
            } else if (response.status === 422) {
                // HTTP 422 Unprocessable Entity - validation failed
                const message = data.message || '';
                
                // Try to parse the backend "<field>: <reason>" message
                if (message.includes(':')) {
                    const parts = message.split(':');
                    const field = parts[0].trim().toLowerCase();
                    const reason = parts.slice(1).join(':').trim();

                    if (field === 'name') {
                        setError(nameInput, nameError, reason);
                        nameInput.focus();
                    } else if (field === 'email') {
                        setError(emailInput, emailError, reason);
                        emailInput.focus();
                    } else if (field === 'phone') {
                        setError(phoneInput, phoneError, reason);
                        phoneInput.focus();
                    } else {
                        showGlobalError(message);
                    }
                } else {
                    showGlobalError(message || 'Validation failed on the server.');
                }
            } else {
                // Other server errors (e.g. 500)
                showGlobalError(data.message || 'An internal server error occurred.');
            }
        } catch (error) {
            // Handle Network connection failures (backend offline)
            console.error('Fetch error:', error);
            showGlobalError('Unable to connect to the verification server. Please ensure the backend is running.');
        } finally {
            // Restore button styling and interactivity
            submitBtn.disabled = false;
            btnText.style.opacity = '1';
            btnLoader.classList.add('hidden');
        }
    });

    function showGlobalError(message) {
        globalErrorText.textContent = message;
        globalError.classList.remove('hidden');
    }
});
