console.log('Started Integration Dashboard Helper');

let g5IntDashHelperMcIntegration = {};
g5IntDashHelperMcIntegration.userName = localStorage.getItem('g5IntDashHelperMcIntegration.userName');
if (!g5IntDashHelperMcIntegration.userName) {
    g5IntDashHelperMcIntegration.userName = prompt('Please enter your name how you want it to appear in notes:\n(Ex: John D)');
    if (g5IntDashHelperMcIntegration.userName) {
        localStorage.setItem('g5IntDashHelperMcIntegration.userName', g5IntDashHelperMcIntegration.userName);
    } else {
        alert('You must enter your name for this bookmarklet to work.');
        return;
    }
}
g5IntDashHelperMcIntegration.vendorUserName = localStorage.getItem('g5IntDashHelperMcIntegration.vendorUserName');
if (!g5IntDashHelperMcIntegration.vendorUserName || !g5IntDashHelperMcIntegration.vendorUserName.toLowerCase() == 'no') {
    g5IntDashHelperMcIntegration.vendorUserName = prompt('Please enter the vendor username. Enter "no" if you do not wish to provide.');
    if (g5IntDashHelperMcIntegration.vendorUserName || g5IntDashHelperMcIntegration.vendorUserName === null) {
        localStorage.setItem('g5IntDashHelperMcIntegration.vendorUserName', g5IntDashHelperMcIntegration.vendorUserName);
    }
}

g5IntDashHelperMcIntegration.vendorPassword = localStorage.getItem('g5IntDashHelperMcIntegration.vendorPassword');
if (!g5IntDashHelperMcIntegration.vendorPassword || !g5IntDashHelperMcIntegration.vendorPassword.toLowerCase() == 'no') {
    g5IntDashHelperMcIntegration.vendorPassword = prompt('Please enter the vendor password. Enter "no" if you do not wish to provide.');
    if (g5IntDashHelperMcIntegration.vendorPassword || g5IntDashHelperMcIntegration.vendorPassword === null) {
        localStorage.setItem('g5IntDashHelperMcIntegration.vendorPassword', g5IntDashHelperMcIntegration.vendorPassword);
    }
}

const date = new Date();
let day = date.getDate();
let month = date.getMonth() + 1;
month = month < 10 ? '0' + month : month;
let year = date.getFullYear().toString().slice(-2);
let currentDate = `${month}/${day}/${year}`;

let requestUrl;
let mcUrl;
const proxyUrl = 'https://www.stralyfamily.com/proxy/';

let lscid;
const lscidElem = document.getElementById('marketing_center_client_vendor_setting_lscid');
if (lscidElem) {
    lscid = lscidElem.value;
    mcUrl = `https://api.myleasestar.com/v2/properties/map?partnername=OneSite&lscid=${encodeURIComponent(lscid)}`;
    requestUrl = `${proxyUrl}?target=${encodeURIComponent(mcUrl)}`;
}
if (lscid.length > 0) {
    function createAlert() {
        const alertDiv = document.createElement("div");
        alertDiv.setAttribute('id', 'alertDiv');
        let firstDiv = document.querySelector('body').firstElementChild;
        document.body.insertBefore(alertDiv, firstDiv);
        let alertText = document.createElement("p");
        alertText.innerHTML = 'Marketing Center / OneSite autofill started<br>It may take some time!<br>This alert will disappear when it is finised.<br><div class="cssLoader"></div>';
        alertDiv.appendChild(alertText);
        alertText.style.margin = '0';
        alertDiv.style.fontFamily = '"Open Sans", sans-serif';
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '2em';
        alertDiv.style.right = '1em';
        alertDiv.style.zIndex = '999';
        alertDiv.style.textAlign = 'center';
        alertDiv.style.borderRadius = '2px';
        alertDiv.style.minHeight = '48px';
        alertDiv.style.lineHeight = '1.5em';
        alertDiv.style.padding = '1.5em';
        alertDiv.style.boxShadow = '0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12), 0 3px 1px -2px rgba(0, 0, 0, .2)';
        alertDiv.style.maxHeight = '150px';
        alertDiv.style.maxWidth = '400px';
        alertDiv.style.fontSize = '15px';
        alertDiv.style.color = 'white';
        alertDiv.style.backgroundColor = 'rgb(163, 190, 140)';
        alertDiv.style.cursor = 'pointer';
        alertDiv.style.transition = 'opacity 3s ease-in-out';
        alertDiv.style.opacity = '1';
        document.body.insertBefore(alertDiv, document.body.firstElementChild);
        alertDiv.addEventListener('click', () => {
            alertDiv.remove();
        });
    }

    function clearAlert() {
        let alertDiv = document.getElementById('alertDiv');
        alertDiv.style.transition = 'opacity 1s ease-in-out';
        alertDiv.style.opacity = '0';
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }

    function addStyleToHead() {
        const css = `.cssLoader {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                animation: spin 2s linear infinite;
                margin-inline: auto;
                margin-top: 1em;
            }
      
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            #userInputAlert {
                background-color: rgb(250, 250, 250);
            }
            #userInputAlert table {
                margin-inline: auto;
            }
            #userInputAlert tr, #userInputAlert th, #userInputAlert td {
                border: 1px solid black;
                text-align: center;
                padding: 0.5em;
            }`;

        const style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }
    addStyleToHead();

    async function fetchData(requestUrl) {
        try {
            const response = await fetch(requestUrl);
            if (!response.ok) {
                throw new Error('Network response was not OK');
            }
            return await response.json();
        } catch (error) {
            console.error(error);
        }
    }

    async function processData() {
        let json = await fetchData(requestUrl);
        let relInfoArr = [];
        for (let i = 0; i < json.length; i++) {
            let locNameObj = {
                partnerCompId: json[i].partnercompanyid.toLowerCase(),
                locName: json[i].lspropertyname.toLowerCase(),
                partnerPropId: json[i].partnerpropertyid,
                lsid: json[i].lspropertyid
            };
            relInfoArr.push(locNameObj);
        }
        return relInfoArr;
    }

    function getUserInput(g5Loc, rpLocs) {
        return new Promise((resolve) => {
            /* Create the custom alert elements */
            const customAlert = document.createElement('div');
            customAlert.id = 'userInputAlert';
            customAlert.style.display = 'block';
            customAlert.style.position = 'fixed';
            customAlert.style.top = '50%';
            customAlert.style.left = '50%';
            customAlert.style.transform = 'translate(-50%, -50%)';
            customAlert.style.padding = '20px';
            customAlert.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
            customAlert.style.borderRadius = '5px';
            customAlert.style.textAlign = 'center';

            if (rpLocs.length > 1) {
                let promptContent = `<p>Do you want me to add any of these?</p><table><thead><tr><th>#</th><th>G5 Name</th><th>OneSite Name</th></tr></thead><tbody>`;
                let userInputsDivContainerHtml = `<div id="userInputsDivContainer">`;
                for (let i = 0; i < rpLocs.length; i++) {
                    promptContent += `<tr><td>${i + 1}</td><td>${g5Loc}</td><td>${rpLocs[i].locName}</td></tr>`;
                    userInputsDivContainerHtml += `<button id="userInputDiv${i + 1}">${i + 1}</button>`;
                }
                promptContent += `</tbody></table>`;
                userInputsDivContainerHtml += `</div>`;
                customAlert.innerHTML = `${promptContent}\n<br>${userInputsDivContainerHtml}`;
                const noButton = document.createElement('button');
                noButton.id = 'noButton';
                noButton.innerText = 'No';
                noButton.style.margin = '10px';
                noButton.style.padding = '10px 20px';
                noButton.style.border = 'none';
                noButton.style.cursor = 'pointer';
                noButton.style.borderRadius = '5px';
                noButton.style.backgroundColor = '#f44336';
                noButton.style.color = '#fff';
                customAlert.appendChild(noButton);

                noButton.addEventListener('click', () => {
                    /* User clicked "No", resolve with 'no' */
                    customAlert.remove();
                    resolve('no');
                });
            } else {
                customAlert.innerHTML = `<p>Do you want to add the suggested name?</p><table><thead><tr><th>G5 Name</th><th>OneSite Name</th></tr></thead><tbody><tr><td>${g5Loc}</td><td>${rpLocs[0].locName}</td></tr></tbody></table>`;
                const yesButton = document.createElement('button');
                yesButton.id = 'yesButton';
                yesButton.innerText = 'Yes';
                yesButton.style.margin = '10px';
                yesButton.style.padding = '10px 20px';
                yesButton.style.border = 'none';
                yesButton.style.cursor = 'pointer';
                yesButton.style.borderRadius = '5px';
                yesButton.style.backgroundColor = '#4CAF50';
                yesButton.style.color = '#fff';

                const noButton = document.createElement('button');
                noButton.id = 'noButton';
                noButton.innerText = 'No';
                noButton.style.margin = '10px';
                noButton.style.padding = '10px 20px';
                noButton.style.border = 'none';
                noButton.style.cursor = 'pointer';
                noButton.style.borderRadius = '5px';
                noButton.style.backgroundColor = '#f44336';
                noButton.style.color = '#fff';
                customAlert.appendChild(yesButton);
                customAlert.appendChild(noButton);

                /* Add event listeners for buttons */
                yesButton.addEventListener('click', () => {
                    /* User clicked "Yes", resolve with 'yes' */
                    customAlert.remove();
                    resolve('yes');
                });

                noButton.addEventListener('click', () => {
                    /* User clicked "No", resolve with 'no' */
                    customAlert.remove();
                    resolve('no');
                });
            }

            /* Add the elements to the document */
            document.body.appendChild(customAlert);

            /* Now that the elements are in the DOM, find and add event listeners */
            if (rpLocs.length > 1) {
                const userInputBtns = document.querySelectorAll('#userInputsDivContainer > button');
                userInputBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        customAlert.remove();
                        resolve(btn.innerText);
                    });
                });
            }
        });
    }

    function suggestSimilarNames(targetName, namesArray) {
        const minSimilarityScore = 0.7;

        function calculateSimilarity(a, b) {
            function levenshteinDistance(a, b) {
                if (a.length === 0) return b.length;
                if (b.length === 0) return a.length;

                const matrix = [];

                for (let i = 0; i <= b.length; i++) {
                    matrix[i] = [i];
                }

                for (let j = 0; j <= a.length; j++) {
                    matrix[0][j] = j;
                }

                for (let i = 1; i <= b.length; i++) {
                    for (let j = 1; j <= a.length; j++) {
                        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
                        matrix[i][j] = Math.min(
                            matrix[i - 1][j] + 1,
                            matrix[i][j - 1] + 1,
                            matrix[i - 1][j - 1] + cost
                        );
                    }
                }

                return matrix[b.length][a.length];
            }
            const maxLength = Math.max(a.length, b.length);
            const distance = levenshteinDistance(a, b);
            return 1 - distance / maxLength;
        }

        const suggestions = [];

        namesArray.forEach(nameObj => {
            const similarity = calculateSimilarity(targetName, nameObj.locName);
            suggestions.push({ ...nameObj, similarity });
        });

        suggestions.sort((a, b) => b.similarity - a.similarity);
        const similarMatches = suggestions.filter(suggestion => suggestion.similarity >= minSimilarityScore);
        return similarMatches;
    }


    async function fillData() {
        createAlert();
        let fetchInfoArr = await processData();

        /* Scrape the integrations dashboard to find out where to place IDs */
        let dashInfoArr = [];
        let formGroups = document.querySelectorAll('.form-horizontal .form-group:not(:first-of-type)');
        for (let i = 0; i < formGroups.length; i++) {
            let locInfo = {
                locName: formGroups[i].firstElementChild.firstElementChild.innerHTML.toLowerCase(),
                locInternalName: formGroups[i].firstElementChild.nextElementSibling.firstElementChild.innerHTML.toLowerCase(),
                locLsid: formGroups[i].firstElementChild.nextElementSibling.nextElementSibling.firstElementChild,
                locPid: formGroups[i].firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling.firstElementChild
            };
            dashInfoArr.push(locInfo);
        }

        /* Place IDs from fetch request, unless there is already an ID present. */
        for (let i = 0; i < dashInfoArr.length; i++) {
            let dashLocName = dashInfoArr[i].locName;
            let exactMatch = fetchInfoArr.find(info => info.locName === dashLocName);
            let commonMatch = fetchInfoArr.filter(info => {
                const lowerDashLocName = dashLocName.toLowerCase();
                const lowerInfoLocName = info.locName.toLowerCase();
                const withoutTheDash = lowerDashLocName.replace(/^the /, '');
                const withoutAptsDash = lowerDashLocName.replace(/ apartments$/, '');
                const withoutTheInfo = lowerInfoLocName.replace(/^the /, '');
                const withoutAptsInfo = lowerInfoLocName.replace(/ apartments$/, '');
                return (
                    lowerInfoLocName === lowerDashLocName || withoutTheInfo === withoutTheDash || withoutAptsInfo === withoutAptsDash
                );
            });
            if (exactMatch) {
                if (dashInfoArr[i].locLsid.value.length <= 0) {
                    console.log(`Found exact match for ${dashInfoArr[i].locName}. Changing Lease Star Property ID from ${dashInfoArr[i].locLsid.value} to ${exactMatch.lsid}.\nChanging Partner Property ID from ${dashInfoArr[i].locPid.value} to ${exactMatch.partnerPropId}.`);
                    dashInfoArr[i].locLsid.value = exactMatch.lsid;
                    dashInfoArr[i].locPid.value = exactMatch.partnerPropId;
                } else {
                    console.log(`${dashInfoArr[i].locName} already has an lsid set "${dashInfoArr[i].locLsid.value}" & pid "${dashInfoArr[i].locPid.value}".`);
                }
            } else if (commonMatch[0]) {
                if (dashInfoArr[i].locLsid.value.length <= 0) {
                    console.log(`Found common match for ${dashInfoArr[i].locName}: ${dashLocName}. Changing Lease Star Property ID from ${dashInfoArr[i].locLsid.value} to ${commonMatch[0].lsid}.\nChanging Partner Property ID from ${dashInfoArr[i].locPid.value} to ${commonMatch[0].partnerPropId}.`);
                    dashInfoArr[i].locLsid.value = commonMatch[0].lsid;
                    dashInfoArr[i].locPid.value = commonMatch[0].partnerPropId;
                } else {
                    console.log(`${dashInfoArr[i].locName} already has an lsid set "${dashInfoArr[i].locLsid.value}" & pid "${dashInfoArr[i].locPid.value}".`);
                }
            } else {
                const similarMatches = suggestSimilarNames(dashLocName, fetchInfoArr);
                if (similarMatches.length > 0) {
                    console.log(`No exact match found for ${dashLocName}. Suggested similar names: ${similarMatches.map(match => match.locName).join(', ')}`);
                    const userInput = await getUserInput(dashLocName, similarMatches);
                    if (userInput.toLowerCase() === 'yes') {
                        dashInfoArr[i].locName = similarMatches[0].locName;
                        dashInfoArr[i].locLsid.value = similarMatches[0].lsid;
                        dashInfoArr[i].locPid.value = similarMatches[0].partnerPropId;
                        console.log(`Added suggested name: ${similarMatches[0].locName}`);
                    } else if (!userInput.toLowerCase() === 'no' || (!isNaN(userInput) && Number.isInteger(Number(userInput)))) {
                        dashInfoArr[i].locName = similarMatches[userInput - 1].locName;
                        dashInfoArr[i].locLsid.value = similarMatches[userInput - 1].lsid;
                        dashInfoArr[i].locPid.value = similarMatches[userInput - 1].partnerPropId;
                        console.log(`Added suggested name: ${similarMatches[userInput - 1].locName}`);
                    }
                }
            }
        }

        for (const formGroup of formGroups) {
            const emptyFields = Array.from(formGroup.querySelectorAll('input.form-control')).filter(field => field.value.length <= 0);
            if (emptyFields.length > 0) {
                formGroup.style.border = '2px solid rgba(225, 205, 0, 0.5)';
                formGroup.style.background = 'rgba(200, 185, 0, 0.15)';
            }
        }

        const marketingCenterFields = [
            document.getElementById('marketing_center_client_vendor_setting_name'),
            document.getElementById('marketing_center_client_vendor_setting_vendor_endpoint'),
            document.getElementById('marketing_center_client_vendor_setting_vendor_endpoint_lead_push'),
            document.getElementById('marketing_center_client_vendor_setting_vendor_user_name'),
            document.getElementById('marketing_center_client_vendor_setting_vendor_password'),
            document.getElementById('marketing_center_client_vendor_setting_partnercid'),
            document.getElementById('marketing_center_client_vendor_setting_lead_push_note_attributes_body'),
            document.getElementById('marketing_center_client_vendor_setting_inventory_sync_note_attributes_body')
        ];

        function runScript() {
            console.log('Started note taker for G5 Integrations Dashboard.');
            let integrationForm = document.querySelector('div.row:last-of-type > div > div.form-horizontal');
            let inventoryNotesField;
            let leadsNotesField;
            function getNotesFields() {
                let panels = document.querySelectorAll('div.panel.panel-default');
                panels.forEach((panel) => {
                    if (panel.querySelector('.panel-heading > .panel-title')) {
                        if (panel.querySelector('.panel-heading > .panel-title').innerHTML.toLowerCase().includes('notes')) {
                            let noteDivs = panel.querySelectorAll('.panel-body > fieldset div.form-group');
                            for (let i = 0; i < noteDivs.length; i++) {
                                let noteLabel = noteDivs[i].querySelector('label').innerHTML;
                                if (noteLabel.toLowerCase().includes('inventory')) {
                                    inventoryNotesField = noteDivs[i].querySelector('textarea');
                                } else if (noteLabel.toLowerCase().includes('leads')) {
                                    leadsNotesField = noteDivs[i].querySelector('textarea');
                                }
                            }
                        }
                    }
                });
            }
            getNotesFields();

            function createNotes(noteLocations) {
                let locationObjs = [];
                noteLocations.forEach((location) => {
                    let locationObj = {
                        name: location.querySelector(':scope > div:first-child > label').innerHTML,
                        internalName: location.querySelector(':scope > div:nth-child(2) > label').innerHTML,
                        lspid: location.querySelector(':scope > div:nth-child(3) > input').value,
                        partnerpid: location.querySelector(':scope > div:nth-child(4) > input').value
                    };
                    if (locationObj.lspid.length > 0 && locationObj.partnerpid.length > 0) {
                        locationObjs.push(locationObj);
                    }
                });
                locationObjs.forEach((location) => {
                    let note = `${currentDate} ${g5IntDashHelperMcIntegration.userName} - Added: ${location.name} (lspid: ${location.lspid} | partnerpid: ${location.partnerpid}).`;
                    if (inventoryNotesField.value.length > 0) {
                        inventoryNotesField.value = `${note}\n${inventoryNotesField.value}`;
                    } else {
                        inventoryNotesField.value = `${note}`;
                    }
                });
            }
            let noteLocations = integrationForm.querySelectorAll('.form-group:not(:first-child):not(.has-location-code)');
            createNotes(noteLocations);
        }
        const g5IntDashUrlRegex = /^https:\/\/integrations\.g5marketingcloud\.com\/client_vendor_settings\/.*\/edit$|^https:\/\/integrations\.g5marketingcloud\.com\/client_vendor_settings\/new\?.*$/;
        g5IntDashUrlRegex.test(window.location.href) ? runScript() : window.alert("You must be in the G5 Integrations Dashboard and have a Client Vendor Settings (CVS) page open in order to run this script.");

        for (const field of marketingCenterFields) {
            if (field.value.length <= 0) {
                switch (field) {
                    case marketingCenterFields[0]:
                        field.value = 'Marketing Center | OneSite';
                        break;
                    case marketingCenterFields[1]:
                        field.value = 'https://api.myleasestar.com';
                        break;
                    case marketingCenterFields[2]:
                        field.value = 'https://lead.myleasestar.com';
                        break;
                    case marketingCenterFields[3]:
                        if (g5IntDashHelperMcIntegration.userName.length > 2 && field.value.length == 0) {
                            field.value = g5IntDashHelperMcIntegration.userName;
                        }
                        break;
                    case marketingCenterFields[4]:
                        if (g5IntDashHelperMcIntegration.userName.length > 2 && field.value.length == 0) {
                            field.value = g5IntDashHelperMcIntegration.password;
                        }
                        break;
                    case marketingCenterFields[6]:
                        if (!field.value.length > 0) {
                            field.value += `${currentDate} ${g5IntDashHelperMcIntegration.userName} - Created`;
                        }
                        break;
                    case marketingCenterFields[7]:
                        if (!field.value.length > 0) {
                            field.value += `${currentDate} ${g5IntDashHelperMcIntegration.userName} - Created`;
                        }
                        break;
                    default:
                        break;
                }
            }
        }

        if (!document.getElementById('mcParseDiv')) {
            const header = document.querySelector('.row.main');
            const mcParseUrlDiv = document.createElement("div");
            const mcParseUrl = `https://www.stralyfamily.com/toolkit/marketing_center_parser/?integration_type=onesite&id=${lscid}`;
            mcParseUrlDiv.setAttribute('id', 'mcParseDiv');
            mcParseUrlDiv.style.padding = '1em';
            mcParseUrlDiv.style.borderRadius = '15px';
            mcParseUrlDiv.style.textAlign = 'center';
            mcParseUrlDiv.style.color = '#406098';
            mcParseUrlDiv.style.background = '#cae4ee';
            mcParseUrlDiv.style.border = '2px solid currentColor';
            const mcParseUrlText = document.createElement("p");
            mcParseUrlText.innerHTML = `Marketing Center Parser`;
            const mcParseUrlAnchor = document.createElement("p");
            mcParseUrlAnchor.innerHTML = `<a href=${mcParseUrl} target="_blank">${mcParseUrl}</a>`;
            mcParseUrlAnchor.querySelector('a').style.color = '#3A539B';
            mcParseUrlText.style.fontSize = '2em';
            mcParseUrlAnchor.style.fontSize = '1.25em';
            mcParseUrlDiv.appendChild(mcParseUrlText);
            mcParseUrlDiv.appendChild(mcParseUrlAnchor);
            header.insertBefore(mcParseUrlDiv, header.firstElementChild);
        }
        clearAlert();
    }
    fillData();
} else {
    window.alert('Please input a Lease Star Company ID (lscid)');
}
