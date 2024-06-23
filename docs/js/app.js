function startAssistant(event){
    console.log(event.currentTarget.id);
    $('#step1').addClass('invisible');
    $('#step2').removeClass('invisible');
}
$( document ).ready(function() {
    $('button').click(startAssistant)
});