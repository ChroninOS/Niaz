document.addEventListener('DOMContentLoaded', function() {
    
    // UI Elements
    const countryDisplay = document.getElementById('countryDisplay');
    const countryList = document.getElementById('countryList');
    const flagIcon = document.getElementById('flag-icon');
    const countryName = document.getElementById('country-name');
    const dialCode = document.getElementById('dialCode');
    const phoneNumber = document.getElementById('phoneNumber');
    const generateBtn = document.getElementById('generateBtn');
    const resultArea = document.getElementById('resultArea');
    const generatedLink = document.getElementById('generatedLink');
    const copyBtn = document.getElementById('copyBtn');
    const openBtn = document.getElementById('openBtn');

    // Data Store
    let countriesData = [];

    // 1. Fetch Countries on Load
    fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags')
        .then(res => res.json())
        .then(data => {
            // Process and Sort Data
            countriesData = data.map(country => ({
                name: country.name.common,
                code: country.idd.root ? (country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : '')) : '',
                flag: country.flags.svg,
                cca2: country.cca2
            })).filter(c => c.code) // Remove countries with no dial code
              .sort((a, b) => a.name.localeCompare(b.name));

            populateDropdown(countriesData);
            
            // Set Default to Bangladesh (as per your request)
            const defaultCountry = countriesData.find(c => c.name === 'Bangladesh');
            if(defaultCountry) selectCountry(defaultCountry);
        })
        .catch(err => {
            console.error('Error fetching countries:', err);
            countryName.textContent = "Failed to load countries";
        });

    // 2. Populate Dropdown
    function populateDropdown(countries) {
        countryList.innerHTML = '';
        countries.forEach(country => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.innerHTML = `
                <img src="${country.flag}" alt="${country.name}">
                <span>${country.name}</span>
                <span class="code">${country.code}</span>
            `;
            item.addEventListener('click', () => {
                selectCountry(country);
                countryList.classList.add('hidden');
            });
            countryList.appendChild(item);
        });
    }

    // 3. Handle Country Selection
    function selectCountry(country) {
        // Update Display
        flagIcon.innerHTML = `<img src="${country.flag}" alt="${country.name}" style="width: 24px;">`;
        countryName.textContent = country.name;
        
        // Update Dial Code
        dialCode.textContent = country.code;
    }

    // 4. Toggle Dropdown
    countryDisplay.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent immediate closing
        countryList.classList.toggle('hidden');
        // Rotate Chevron
        const chevron = countryDisplay.querySelector('.chevron');
        if(countryList.classList.contains('hidden')) {
            chevron.style.transform = 'rotate(0deg)';
        } else {
            chevron.style.transform = 'rotate(180deg)';
        }
    });

    // Close dropdown if clicking outside
    document.addEventListener('click', (e) => {
        if (!countryDisplay.contains(e.target)) {
            countryList.classList.add('hidden');
            countryDisplay.querySelector('.chevron').style.transform = 'rotate(0deg)';
        }
    });

    // 5. Generate Link
    generateBtn.addEventListener('click', () => {
        const code = dialCode.textContent.replace('+', '');
        // Remove non-numeric chars from phone
        const number = phoneNumber.value.replace(/\D/g, '');

        if (!number) {
            phoneNumber.style.borderColor = '#e74c3c'; // Red alert
            setTimeout(() => phoneNumber.style.borderColor = '', 2000);
            return;
        }

        const fullLink = `https://wa.me/${code}${number}`;
        
        // Show Result
        generatedLink.textContent = fullLink;
        openBtn.href = fullLink;
        resultArea.classList.remove('hidden');
    });

    // 6. Copy Functionality
    copyBtn.addEventListener('click', () => {
        const text = generatedLink.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            copyBtn.style.color = '#16A085';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
                copyBtn.style.color = '';
            }, 2000);
        });
    });

    // Allow "Enter" key to generate
    phoneNumber.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') generateBtn.click();
    });
});