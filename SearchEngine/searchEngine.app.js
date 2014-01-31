/*global $, PORTFOLIO */
/*jslint browser: true */

/*portfolio require portfolio:jquery */
/*portfolio require portfolio:jquery.ui */
/*portfolio require jquery/smoothness/jquery-ui-1.8.18.custom.css */

/*portfolio require js/messages.js */
/*portfolio require js/oo_searchEngine.js */
/*portfolio require js/searchEngineDesign.js */
/*portfolio require js/PF_manager.js */

/*portfolio require js/tinyscrollbar/tinyscrollbar.min.js */

/*portfolio require css/searchEngine.css */


$(document).ready(function() {
  
    var apps = PORTFOLIO.APP.get("searchEngine");
    
    $.each( apps , function ( i, app ) {
    var app_config = {
            site_url       : app.site_url,
            app_id         : app.app_id,
            dom_id         : app.dom_id,
            app_base_url   : app.app_base_url,
            base_url       : app.base_url,
            app_input_id   : app.app_input_id,
            ui_language    : app.ui_language   
        };
    $('#' + app.dom_id).searchEngine(app_config);
    return true;  
});

});