// Mobile menu toggle
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (!mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        }
    });
});

// Form validation and submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    // Form validation
    function validateField(field, errorElement, validationRules) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Check if field is required
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required.';
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address.';
            }
        }

        // Subject validation (prevent spam)
        if (field.id === 'subject' && value) {
            if (value.length < 3) {
                isValid = false;
                errorMessage = 'Subject must be at least 3 characters long.';
            }
            if (value.length > 100) {
                isValid = false;
                errorMessage = 'Subject must be less than 100 characters.';
            }
        }

        // Message validation
        if (field.id === 'message' && value) {
            if (value.length < 10) {
                isValid = false;
                errorMessage = 'Message must be at least 10 characters long.';
            }
            if (value.length > 1000) {
                isValid = false;
                errorMessage = 'Message must be less than 1000 characters.';
            }
        }

        // Update UI
        if (isValid) {
            field.classList.remove('border-red-500');
            field.classList.add('border-gray-300');
            errorElement.classList.add('hidden');
        } else {
            field.classList.remove('border-gray-300');
            field.classList.add('border-red-500');
            errorElement.textContent = errorMessage;
            errorElement.classList.remove('hidden');
        }

        return isValid;
    }

    // Real-time validation
    const formFields = contactForm.querySelectorAll('input, textarea');
    formFields.forEach(field => {
        field.addEventListener('blur', () => {
            const errorElement = document.getElementById(field.id + 'Error');
            if (errorElement) {
                validateField(field, errorElement);
            }
        });
    });

    // Form submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Honeypot check (spam protection)
        const honeypot = document.getElementById('honeypot');
        if (honeypot.checked) {
            console.log('Bot detected');
            return;
        }

        // Validate all fields
        let isFormValid = true;
        const fieldsToValidate = [
            { field: document.getElementById('name'), error: document.getElementById('nameError') },
            { field: document.getElementById('email'), error: document.getElementById('emailError') },
            { field: document.getElementById('subject'), error: document.getElementById('subjectError') },
            { field: document.getElementById('message'), error: document.getElementById('messageError') },
            { field: document.getElementById('agree'), error: document.getElementById('agreeError') }
        ];

        fieldsToValidate.forEach(({ field, error }) => {
            if (!validateField(field, error)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            return;
        }

        // Show loading state
        const submitBtn = document.getElementById('submitBtn');
        const submitText = document.getElementById('submitText');
        const submitSpinner = document.getElementById('submitSpinner');
        const formSuccess = document.getElementById('formSuccess');
        const formError = document.getElementById('formError');

        submitBtn.disabled = true;
        submitText.textContent = 'Sending...';
        submitSpinner.classList.remove('hidden');
        formSuccess.classList.add('hidden');
        formError.classList.add('hidden');

        // Prepare form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            subject: document.getElementById('subject').value.trim(),
            message: document.getElementById('message').value.trim(),
            to: 'absalomshishiveni67@mail.com'
        };

        try {
            // Initialize EmailJS
            emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your EmailJS public key

            // Send email using EmailJS
            const templateParams = {
                to_email: 'absalomshishiveni67@mail.com',
                from_name: formData.name,
                from_email: formData.email,
                subject: formData.subject,
                message: formData.message
            };

            await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams);

            // Show success message
            formSuccess.textContent = 'Thank you! Your message has been sent successfully. I will get back to you soon.';
            formSuccess.classList.remove('hidden');
            contactForm.reset();

        } catch (error) {
            console.error('Email sending failed:', error);
            // Show error message
            formError.textContent = 'Sorry, there was an error sending your message. Please try again or contact me directly.';
            formError.classList.remove('hidden');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitText.textContent = 'Send Message';
            submitSpinner.classList.add('hidden');
        }
    });
}
