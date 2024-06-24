class MigrationApp{


    sourceJWT = null;
    sourceInstance = null;

    targetJWT = null;
    targetInstance = null;

    exportedData = null;


    #currentStep = 'init';

    #stepGraph = new Map([
        ["init", 'step-start'],
        ['step-start', 'step-login-source'],
        ['step-login-source', 'step-export-data'],
        ['step-export-data', 'step-save-data'],
        ['step-save-data', 'step-login-target'],
        ['step-login-target', 'step-import-data'],
        
    ]);

    stepFuncMap = new Map([
        ['step-start', this.completeStepStart],
        ['step-login-source', this.completeStepLoginSource],
        ['step-export-data', this.completeStepExportData],
        ['step-save-data', this.completeStepSaveData],
        ['step-login-target', this.completeStepLoginTarget],
    ]);

    enterStepMap = new Map([
        ['step-export-data', this.enterStepExportData],
        ['step-import-data', this.enterStepImportData],
        ['step-save-data', this.enterStepSaveData]
    ]);

    btnMapping = new Map([
        ['btn-step-export-data-export', this.stepExportDataExecute],
        ['btn-step-import-data-retry', this.restartImport],
        ['btn-step-step-save-data-download', this.downloadExport],
    ]);

    init(){
        this.enterStep(this.#stepGraph.get('init'));
    }

    enterStep(step){
        console.log('entering step ' + step);
        $('section').addClass('invisible');
        $('button').prop("disabled",true);
        $('#'+step).removeClass('invisible');
        $('#btn-'+step).prop("disabled",false);
        this.#currentStep = step;
        if(this.enterStepMap.get(this.#currentStep)){
            this.enterStepMap.get(this.#currentStep)(this);
        }
        
    }
    restartExport(application){
        app.enterStep('step-export-data')
    }
    restartImport(app){
        app.enterStep('step-import-data')
    }

    completeStepStart(app){
        return true;
    }

    downloadExport(app){
        app.saveFile("export.json", "data:application/json", JSON.stringify(app.exportedData))
    }

    enterStepSaveData(app){
        $('#btn-step-step-save-data-download').prop("disabled",false);
        $('#exportTextfield').val(JSON.stringify(app.exportedData));
    }

    completeStepSaveData(){
        return true;
    }

    saveFile (name, type, data) {
        if (data !== null && navigator.msSaveBlob)
            return navigator.msSaveBlob(new Blob([data], { type: type }), name);
        var a = $("<a style='display: none;'/>");
        var url = window.URL.createObjectURL(new Blob([data], {type: type}));
        a.attr("href", url);
        a.attr("download", name);
        $("body").append(a);
        a[0].click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }

    async enterStepImportData(app){
        $('#btn-step-import-data-retry').prop("disabled",true);
        $('#import-succeeded').addClass('invisible');
        $('#import-failed').addClass('invisible');
        let response = null
        try {
            response = await importData(app.targetInstance, app.targetJWT, app.exportedData);
            if(response.ok){
                app.result = await response.json();
                app.showSuccessSnackbar("Import succeeded");
                $('#source-import-progress').addClass('invisible');
                $('#btn-step-import-data').prop("disabled",false);
                $('#import-succeeded').removeClass('invisible');
                console.log('ready');
                console.log(app.result);
            }else{
                    const jsonResponse = await response.json();
                    console.log(JSON.stringify(jsonResponse));
                    app.showErrorSnackbar(JSON.stringify(jsonResponse));
                    $('#btn-step-import-data-retry').prop("disabled",false);
                    $('#import-failed').removeClass('invisible');
                }
        } catch (error) {
            console.log(error);
            app.showErrorSnackbar(error);
            $('#btn-step-import-data-retry').prop("disabled",false);
        }
    }

    async stepExportDataExecute(app){
        $('#source-export-progress').removeClass('invisible');
        let response = null
        try {
            response = await exportData(app.sourceInstance, app.sourceJWT);
            if(response.ok){
                app.exportedData = await response.json();
                app.showSuccessSnackbar("Export succeeded");
                $('#source-export-progress').addClass('invisible');
                $('#btn-step-export-data').prop("disabled",false);
                $('#btn-step-export-data-export').prop("disabled",true);
                $('#export-succeeded').removeClass('invisible');
                console.log('ready');
                console.log(app.exportedData);
                $('#source-export-progress').addClass('invisible');
            }else{
                    const jsonResponse = await response.json();
                    const message =JSON.stringify(jsonResponse);
                    console.log(message);
                    app.showErrorSnackbar(message);
                    $('#btn-step-export-data-export').prop("disabled",false);
                    $('#export-failed').removeClass('invisible');
                    $('#export-error-text').text(message);
                    $('#source-export-progress').addClass('invisible');
                }
        } catch (error) {
            console.log(error);
            app.showErrorSnackbar(error);
            $('#btn-step-export-data-export').prop("disabled",false);
            $('#source-export-progress').addClass('invisible');
        }
    }

    async enterStepExportData(app){
        $('#btn-step-export-data').prop("disabled",true);
        $('#btn-step-export-data-export').prop("disabled",false);
        $('#export-succeeded').addClass('invisible');
        $('#export-failed').addClass('invisible');
    }

    completeStepExportData(app){
        return true;
    }

    async completeStepLoginTarget(app){
        $('#target-login-progress').removeClass('invisible');
        const instanceTarget = $('#instance-target').val();
        const usernameTarget = $('#username-target').val();
        const passwordTarget = $('#password-target').val();
        const twoFATarget = $('#2fa-target').val();
        if(usernameTarget == '' || passwordTarget == ''){
            return false;
        }
        let response = null
        try {
        response = await loginLemmy(instanceTarget, usernameTarget, passwordTarget, twoFATarget);
        console.log("login response:", response.status);
        if(response.ok){
            const jsonResponse = await response.json();
            app.targetJWT = jsonResponse.jwt;
            app.showSuccessSnackbar("Login completed");
            $('#target-login-progress').addClass('invisible');
            app.targetInstance = instanceTarget;
            return true;
        }else{
            const jsonResponse = await response.json();
            console.log(JSON.stringify(jsonResponse));
            app.showErrorSnackbar(JSON.stringify(jsonResponse));
        }
        } catch (error) {
            console.log(error);
            app.showErrorSnackbar(error);
        }
        $('#target-login-progress').addClass('invisible');
        return false;
    }

    async completeStepLoginSource(app){
        $('#source-login-progress').removeClass('invisible');
        const instanceSource = $('#instance-source').val();
        const usernameSource = $('#username-source').val();
        const passwordSource = $('#password-source').val();
        const twoFASource = $('#2fa-source').val();
        if(usernameSource == '' || passwordSource == ''){
            return false;
        }
        let response = null
        try {
        response = await loginLemmy(instanceSource, usernameSource, passwordSource, twoFASource);
        console.log("login response:", response.status);
        if(response.ok){
            const jsonResponse = await response.json();
            app.sourceJWT = jsonResponse.jwt;
            app.showSuccessSnackbar("Login completed");
            $('#source-login-progress').addClass('invisible');
            app.sourceInstance = instanceSource;
            return true;
        }else{
            const jsonResponse = await response.json();
            console.log(JSON.stringify(jsonResponse));
            app.showErrorSnackbar(JSON.stringify(jsonResponse));
        }
        } catch (error) {
            console.log(error);
            app.showErrorSnackbar(error);
        }
        $('#source-login-progress').addClass('invisible');
        return false;
    }


    async btnClicked(app, event){
        const stepID = event.currentTarget.id.substring(4);
        console.log(stepID);
        console.log(this.stepFuncMap.get(stepID));
        if(this.btnMapping.get(event.currentTarget.id)){
            this.btnMapping.get(event.currentTarget.id)(app);
        }
        else if(await this.stepFuncMap.get(stepID)(app)){
            this.enterStep(this.#stepGraph.get(stepID));
        }
    }

    showErrorSnackbar(errorMessage){
        var snackbarContainer = $('#snackbar-error').get(0);
        var data = {message: 'Error: ' + errorMessage};
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
    }
    showSuccessSnackbar(successMessage){
        var snackbarContainer = $('#snackbar-success').get(0);
        var data = {message: successMessage};
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
    }

}




const app = new MigrationApp();

$( document ).ready(function() {
    app.init();
    $('button').click(btnClicked);
});

function btnClicked(event){
    app.btnClicked(app,event);
}

async function loginLemmy(instance, username, password, twoFASource){

    const response = await fetch("https://"+instance+"/api/v3/user/login", {
        method: "POST", 
        mode: "cors", 
        cache: "no-cache", 
        credentials: "same-origin", 
        headers: {
          "Content-Type": "application/json",
        },
        referrerPolicy: "strict-origin-when-cross-origin",
        body: JSON.stringify({
            "username_or_email" : username,
            "password" : password,
            "totp_2fa_token": twoFASource
        }),
      });
      return response;
    }

    async function exportData(instance, jwt){

        const response = await fetch("https://"+instance+"/api/v3/user/export_settings", {
            method: "GET", 
            mode: "cors", 
            cache: "no-cache", 
            credentials: "same-origin",
            headers: {
              "Authorization": "Bearer "+jwt,
            },
            referrerPolicy: "strict-origin-when-cross-origin", 
          });
          return response;
        }

    async function importData(instance, jwt, exportedData){

        const response = await fetch("https://"+instance+"/api/v3/user/import_settings", {
            method: "POST", 
            mode: "cors", 
            cache: "no-cache", 
            credentials: "same-origin",
            headers: {
                "Authorization": "Bearer "+jwt,
                "Content-Type": "application/json",
            },
            referrerPolicy: "strict-origin-when-cross-origin", 
            body: JSON.stringify({
                exportedData
            }),
        });
        return response;
    }