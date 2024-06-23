class MigrationApp{

    #sourceJWT = null;
    
    #stepList = [
        "init",
        'step-start',
        'step-login-source'
    ]

    #currentStep = this.#stepList[0];

    #stepGraph = new Map([
        ["init", 'step-start'],
        ['step-start', 'step-login-source'],
    ]);

    stepFuncMap = new Map([
        ['step-start', this.#completeStepStart],
        ['step-login-source', this.#completeStepLoginSource],
    ]);
    
    init(){
        this.enterStep(this.#stepGraph.get(this.#currentStep));
    }

    enterStep(step){
        console.log('entering step ' + step);
        $('section').addClass('invisible');
        $('button').prop("disabled",true);
        $('#'+step).removeClass('invisible');
        $('#btn-'+step).prop("disabled",false);
        this.#currentStep = step;
    }

    #completeStepStart(){
        return true;
    }

    async #completeStepLoginSource(){
        const usernameSource = $('#username-source').val();
        const passwordSource = $('#password-source').val();
        const twoFASource = $('#2fa-source').val();
        if(usernameSource == '' || passwordSource == ''){
            return false;
        }

        let response = await loginLemmy('feddit.de', usernameSource, passwordSource, twoFASource);
        //const r = new Request("https://feddit.de/api/v3/user/login");
    //fetch(r).then((response) => response.json()).then((out => alert(JSON.stringify(out.communities))))
    }


    btnClicked(event){
        const stepID = event.currentTarget.id.substring(4);
        if(this.stepFuncMap.get(stepID)()){
            this.enterStep(this.#stepGraph.get(stepID));
        }
    }
}

async function loginLemmy(instance, usernameSource, passwordSource, twoFASource){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "https://"+instance+"/api/v3/user/login",
            type: 'POST',
            body: '',
            timeout: 30000,
            success: (response) => {
                resolve(response);
            },
            error: (response) => {
                reject(response);
            }
        })
    })
}

const app = new MigrationApp();

$( document ).ready(function() {
    app.init();
    $('button').click(btnClicked);
});

function btnClicked(event){
    app.btnClicked(event);
}