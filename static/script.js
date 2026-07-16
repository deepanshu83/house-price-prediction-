document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.scroll-animate').forEach(element => {
        observer.observe(element);
    });

    const form = document.getElementById('predictionForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn?.querySelector('.btn-text');
    const spinner = submitBtn?.querySelector('.spinner');
    const resultCard = document.getElementById('result');
    const predictedPriceEl = document.getElementById('predicted-price');
    const resultMessage = document.getElementById('result-message');

    if (!form || !submitBtn || !btnText || !spinner || !resultCard || !predictedPriceEl || !resultMessage) {
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        resultCard.classList.add('hidden');

        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');

        const formData = {
            MedInc: parseFloat(document.getElementById('MedInc').value),
            HouseAge: parseFloat(document.getElementById('HouseAge').value),
            AveRooms: parseFloat(document.getElementById('AveRooms').value),
            AveBedrms: parseFloat(document.getElementById('AveBedrms').value),
            Population: parseFloat(document.getElementById('Population').value),
            AveOccup: parseFloat(document.getElementById('AveOccup').value),
            Latitude: parseFloat(document.getElementById('Latitude').value),
            Longitude: parseFloat(document.getElementById('Longitude').value)
        };

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Prediction request failed. Please verify your input values.');
            }

            const data = await response.json();
            const predictedValue = Number(data['Predicted Price']);

            resultCard.classList.remove('hidden');
            resultMessage.textContent = 'Your AI estimate is ready.';
            animateNumber(predictedPriceEl, 0, predictedValue, 1500);

            setTimeout(() => {
                resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        } catch (error) {
            resultMessage.textContent = error.message || 'An unexpected error occurred while connecting to the server.';
            resultCard.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            spinner.classList.add('hidden');
        }
    });

    function animateNumber(element, start, end, duration) {
        let startTimestamp = null;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = start + (end - start) * easeProgress;

            element.textContent = '$' + currentVal.toLocaleString('en-US', {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3
            });

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = '$' + end.toLocaleString('en-US', {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3
                });
            }
        };

        window.requestAnimationFrame(step);
    }
});
