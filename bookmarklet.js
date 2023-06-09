javascript: (() => {
    function functionStartAlert() {
        const alertDiv = document.createElement("div");
        alertDiv.setAttribute('id', 'scaperAlertDiv');

        let firstDiv = document.querySelector('body').firstElementChild;
        document.body.insertBefore(alertDiv, firstDiv);
        
        let alertText = document.createElement("p");
        alertText.innerHTML = "Marketing Center / OneSite autofill started<br>It may take some time!";
        
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
        alertDiv.style.opacity = '1';
        alertDiv.style.transition = 'opacity 3s';
        setTimeout(() => {
            alertDiv.style.opacity = '0';
            setTimeout(() => {
                alertDiv.remove();
            }, 3000);
        }, 10000);
        alertDiv.addEventListener('click', () => {
            alertDiv.remove();
        })
    }
    functionStartAlert();

    console.log('Started Integration Dashboard Helper');
    let lscid = document.getElementById('marketing_center_client_vendor_setting_lscid').value;
    let proxyUrl = 'https://proxy.stralyfamily.com/index/proxy.php';

    let mcUrl = `https://api.myleasestar.com/v2/properties/map?partnername=OneSite&lscid=${encodeURIComponent(lscid)}`;
    let requestUrl = `${proxyUrl}?url=${encodeURIComponent(mcUrl)}`;

    async function fetchData(requestUrl) {
        try {
            let response = await fetch(requestUrl);
            if (!response.ok) {
                throw new Error('Network response was not OK');
            }
            let jsonData = await response.json();
            return jsonData;
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

    async function fillData() {
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
            for (let j = 0; j < fetchInfoArr.length; j++) {
                let fetchLocName = fetchInfoArr[j].locName;
                if (dashLocName === fetchLocName) {
                    if (dashInfoArr[i].locLsid.value.length <= 0) {
                        console.log(`Found match for ${dashInfoArr[i].locName}. Changing Lease Star Property ID from ${dashInfoArr[i].locLsid.value} to ${fetchInfoArr[j].lsid}.\n
                        Changing Partner Property ID from ${dashInfoArr[i].locPid.value} to ${fetchInfoArr[j].partnerPropId}.`);
                        dashInfoArr[i].locLsid.value = fetchInfoArr[j].lsid;
                        dashInfoArr[i].locPid.value = fetchInfoArr[j].partnerPropId;
                    } else {
                        console.log(`${dashInfoArr[i].locName} already has a lsid set "${dashInfoArr[i].locLsid.value}" & pid "${dashInfoArr[i].locPid.value}".`);
                    }
                }
            }
        }

        /* After the code above runs, check for empty inputs, and highlight the formgroup in yellow if they are still empty */
        for (let i = 0; i < formGroups.length; i++) {
            let formFields = formGroups[i].querySelectorAll('input.form-control');
            for (let j = 0; j < formFields.length; j++) {
                if (formFields[j].value.length <= 0) {
                    formGroups[i].style.border = '2px solid rgba(225, 205, 0, 0.5)';
                    formGroups[i].style.background = 'rgba(200, 185, 0, 0.15)';
                }
            }
        }

        /* Change client wide settings */
        let marketingCenterName = document.getElementById('marketing_center_client_vendor_setting_name');
        let marketingCenterInventoryEndpoint = document.getElementById('marketing_center_client_vendor_setting_vendor_endpoint');
        let marketingCenterLeadEndpoint = document.getElementById('marketing_center_client_vendor_setting_vendor_endpoint_lead_push');
        let marketingCenterPartnerCompanyId = document.getElementById('marketing_center_client_vendor_setting_partnercid');
        let credentials = [marketingCenterName, marketingCenterInventoryEndpoint, marketingCenterLeadEndpoint, marketingCenterPartnerCompanyId];

        for (let i = 0; i < credentials.length; i++) {
            if (credentials[i].value.length <= 0) {
                marketingCenterName.value = 'Marketing Center | OneSite';
                marketingCenterInventoryEndpoint.value = 'https://api.myleasestar.com';
                marketingCenterLeadEndpoint.value = 'https://lead.myleasestar.com';
                marketingCenterPartnerCompanyId.value = fetchInfoArr[0].partnerPropId;
            }
        }
    }
    fillData();
})();
