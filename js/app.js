var $log = function(e){
    return console.log(e);
}
var $select = function(e){
    return document.querySelector(e);
}

/* 

***TO DO***

RETHINK SUGGESTION'S LAYOUT
    LESS SPACE FOR OPTIONS
    RE-DESIGN OF SUGGESTION
    BUTTONS BACK AND REMAKE
FINAL VISUAL DETAILS (CLOUDS?)

*/

/*

UI CONTROLLER

*/

var UIController = (function(){
    
    // DOM
    
    var DOMStrings = {
        
        workspace: '.workspace',
        mainScreen: '.main_screen',
        mainScreenBtns: '.main_screen .buttons',
        resultScreen: '.result_screen',
        textSuggestion: '.text_suggestion',
        optionsThemes: '.options .themes',
        optionsTypes: '.options .types',
        optionsTypesHolder: '.options .types .types_holder',
        btnBack: '.btn_back',   
        btnRemake: '.btn_remake',
        btnInfo: '.btn_info',
        btnSupport: '.btn_support',
        infoBox: '.info_box',
        supportBox: '.support_box',
        
    }    
    
    var typeLimit = 4;
    var currentCategoryID;
    
    function getTypeNumber(e){
        return Number(e.split('type')[1]);
    }
    
    return {
        
        // CREATE MAIN SCREEN
        createMainScreen: function(){
            
            // CREATE MAIN SCREEN ELEMENTS
            
            var categories = dataController.getCategoriesList();
            
            for (var i = 0; i < categories.length; i++){
                
                var htmlContent = '<div class="ms_btn" id="category_btn' + i + '"><img src="' + categories[i].img + '" alt="' + categories[i].name + '" /></div>';
                
                $select(DOMStrings.mainScreenBtns).insertAdjacentHTML('beforeend', htmlContent);    
                
                // ADD LISTENERS
                $select('#category_btn' + i).addEventListener('click', UIController.clickCategory);

            }
            
        },
        
        // CLICK CATEGORY
        clickCategory: function(e){
            
            var htmlElementID = e.target.parentNode.id;
            currentCategoryID = Number(htmlElementID.split('category_btn')[1]);
            
            // CHANGE SCREEN TO RESULT
            Velocity($select(DOMStrings.mainScreen), 'fadeOut', {delay: 0, easing: "easeOut", duration: 250, complete: UIController.goSuggestionScreen(currentCategoryID)});
            
        },
        
        // DISPLAY SUGGESTION
        displaySuggestion: function(){
            
            var htmlContent = dataController.getCurrentSuggestion();
                
            $select(DOMStrings.textSuggestion).innerHTML = htmlContent;
            
        },
        
        // REMAKE SUGGESTION
        remakeSuggestion: function(e){
            
            Velocity($select(DOMStrings.textSuggestion), {opacity: 0}, {delay: 0, easing: "easeOut", duration: 200, complete: function(){
            
                dataController.createSuggestion(dataController.getCurrentCategory());
                Velocity($select(DOMStrings.textSuggestion), {opacity: 1}, {delay: 50, easing: "easeOut", duration: 200});
                
            }});
            
        },
        
        // GO TO SUGGESTION SCREEN
        goSuggestionScreen: function(id){
            
            // CLEAR ALL THEMES AND TYPES
            $select(DOMStrings.optionsThemes).innerHTML = '';
            $select(DOMStrings.optionsTypesHolder).innerHTML = '';
            
            var category = dataController.getCategoriesList()[id];
            dataController.updateContent(id);
            
            // CREATE AND SET THEMES
            for (var i = 0; i < category.themes.length; i++){
                
                var currentTheme = category.themes[i];
                var isActive = '';
                
                if(Number(currentTheme.getAttribute('active')) === 1){
                    isActive = ' active';
                }
                
                var htmlContent = '<div class="theme' + isActive + '" id="theme' + i + '">' + currentTheme.getAttribute('name') + '</div>';
                
                $select(DOMStrings.optionsThemes).insertAdjacentHTML('beforeend', htmlContent);    
                
                // ADD LISTENERS
                $select('#theme' + i).addEventListener('click', UIController.clickTheme);
                
            }
            
            // CREATE AND SET TYPES
            
            var categoryTypes = String(category.columns).split(",");
            var categoryTypesSet = String(category.columnsSet).split(",");
            var typeWidth = Math.floor(100 / categoryTypes.length);
            
            for (var j = 0; j < categoryTypes.length; j++){
                
                var htmlContent = '<div class="type" id="type' + j + '" style="width: ' + typeWidth + '%;"><div class="btn_minus">-</div><div class="btn_plus">+</div><div class="type_amount">' + categoryTypesSet[j] + '</div><div class="type_name">' + categoryTypes[j] + '</div></div>'
                
                $select(DOMStrings.optionsTypesHolder).insertAdjacentHTML('beforeend', htmlContent);    
                
                // ADD LISTENERS
                $select('#type' + j).addEventListener('mouseenter', UIController.enterType);
                $select('#type' + j).addEventListener('mouseleave', UIController.leaveType);
                $select('#type' + j + ' .btn_minus').addEventListener('click', UIController.clickType);
                $select('#type' + j + ' .btn_plus').addEventListener('click', UIController.clickType);
                
            }
        
            // CREATE SUGGESTION
            dataController.createSuggestion(category);
            
            // FADEIN
            Velocity($select(DOMStrings.resultScreen), 'fadeIn', {delay: 400, easing: "easeOut", duration: 250});
            
        },
        
        // CLICK EVENTS > TYPE
        enterType: function(e){
            
            $select('#' + e.target.id + ' .btn_minus').style.display = 'block';
            $select('#' + e.target.id + ' .btn_plus').style.display = 'block';
            
            // CHANGE OPACITY OF SPANS
            $select(DOMStrings.textSuggestion).classList.add('type-mode');
            $select('.block' + getTypeNumber(e.target.id)).classList.add('active');
        },
        
        leaveType: function(e){
            $select('#' + e.target.id + ' .btn_minus').style.display = 'none';
            $select('#' + e.target.id + ' .btn_plus').style.display = 'none';
            
            $select(DOMStrings.textSuggestion).classList.remove('type-mode');
            $select('.block' + getTypeNumber(e.target.id)).classList.remove('active');
        },
        
        clickType: function(e){
            
            var currentClass = e.target.getAttribute('class');
            var currentID = Number(String(e.target.parentNode.id).split('type')[1]);
            var currentCategory = dataController.getCurrentCategory();
            var currentSet = currentCategory.columnsSet.split(',');
            
            // MINUS OR PLUS?
            if(currentClass === 'btn_plus'){
              
                if(Number(currentSet[currentID]) < typeLimit)
                {
                    // UPDATE KEY VALUE
                    currentSet[currentID] = Number(currentSet[currentID]) + 1;
                    currentCategory.columnsSet = String(currentSet);
                    
                    var newBlock = dataController.pickOption(dataController.getCurrentContent()[currentID], currentID);
                    var htmlContent = '<span class="type' + currentID + '">' + newBlock + '</span> ';
                    
                    UIController.addSuggestion(currentID, htmlContent);
                    dataController.updateCurrentSuggestion(currentID, true, newBlock);
                }
                
            } else if (currentClass === 'btn_minus'){
                
                if(Number(currentSet[currentID]) > 0)
                {
                    // UPDATE KEY VALUE
                    currentSet[currentID] = Number(currentSet[currentID]) - 1;
                    currentCategory.columnsSet = String(currentSet);
                    UIController.removeSuggestion(currentID);
                    
                    // UPDATE CURRENT SUGGESTION
                    dataController.updateCurrentSuggestion(currentID, false);
                }
                
            }
            
            // UPDATE UI
            var divAmount = $select('#type' + currentID + ' .type_amount');
            divAmount.innerHTML = currentSet[currentID];
            
            
        },
        
        // CLICK EVENTS > THEME
        
        clickTheme: function(e){
          
            var currentID = Number(String(e.target.id).split('theme')[1]);
            var currentTheme = dataController.getCurrentCategory().themes[currentID];
            var themeList = dataController.getCurrentCategory().themes;
            
            // IF THEME ACTIVE
            if(currentTheme.getAttribute('active') === '1'){
                
                // CHECK IF THERE'S ANY OTHER THEME ON
                var activeThemes = 0;
                
                for(var i = 0; i < themeList.length; i++){
                    if(themeList[i].getAttribute('active') === '1') activeThemes++;
                }
                
                // DEACTIVATE
                if(activeThemes > 1){
                    
                    currentTheme.setAttribute('active', '0');
                    $select('#' + e.target.id).classList.remove('active');
                    
                }
                
            } else if (currentTheme.getAttribute('active') === '0'){
                
                // ACTIVATE
                currentTheme.setAttribute('active', '1');
                $select('#' + e.target.id).classList.add('active');
                
            }
                
            // UPDATE CURRENT CONTENT ARRAY
            dataController.updateContent(currentCategoryID);
        },
        
        addSuggestion: function(block, htmlContent){
            $select('.block' + block).insertAdjacentHTML('beforeend', htmlContent);    
        },
        
        removeSuggestion: function(block){
            //$select('.block' + block)
            var htmlBlock = $select('.block' + block);
            var elems = htmlBlock.getElementsByTagName("span");
            
            htmlBlock.removeChild(elems[elems.length - 1]);
        },
        
        // RETURN DOM STRINGS
        getDOM: function(){
            return DOMStrings;
        },
        
        // RETURN TO MAIN SCREEN
        returnMainScreen: function(){
            
            Velocity($select(DOMStrings.resultScreen), 'fadeOut', {delay: 0, easing: "easeOut", duration: 250, complete: function(){
            
                Velocity($select(DOMStrings.mainScreen), 'fadeIn', {delay: 100, easing: "easeOut", duration: 250});
                
            }});
            
        }
        
    }
    
})();

/*

DATA CONTROLLER

*/

var dataController = (function(){

    var Category = function(eName, eImg, eCol, eColSet, eThemes){
        
        this.name = eName;
        this.img = eImg;
        this.columns = eCol;
        this.columnsSet = eColSet;
        this.themes = eThemes;
        
    }
    
    var categoriesList = [];        // STORE CURRENT CATEGORY PROPERTIES
    var categoriesListDefault = []; // STORE DEFAULT CATEGORY PROPERTIES
    var categoriesThemes = [];
    
    var currentCategory;
    var currentContent = [];        // MIX OF ACTIVE CONTENTS
    var currentSuggestion = [];     // THE CURRENT FINAL SUGGESTION
    
    var suggestionUI = '';
    
    return {
        
        // IMPORT CONTENT
        importContent: function(){

            // IMPORT XML
            // CODE BY John Paul Mueller
            var connect = new XMLHttpRequest();
            connect.open('GET', 'content/categories.xml', false);
            connect.setRequestHeader("Content-Type", "text/xml");
            connect.send(null);
            
            // PLACE RESPONSE OF XML DOCUMENT
            var xmlDoc = connect.responseXML;
            
            // PLACE ROOT NODE OF XML ON ELEMENT
            var xmlCategoriesList = xmlDoc.childNodes[0];
            
            // IMPORT NEW CATEGORY
            var currentImportedCategory = 0;
            var categoriesLength = xmlCategoriesList.children.length;
            
            function importNewCategory(){
                
                // GETS BASIC DATA FROM XML
                var xmlCurrentCategory = xmlCategoriesList.children[currentImportedCategory];
                
                // STORE CORE VALUES FROM XML
                var xmlCurrentInfo = xmlCurrentCategory.getElementsByTagName('info')[0];
                var xmlCurrentThemes = xmlCurrentCategory.getElementsByTagName('themes')[0];
                var eName = xmlCurrentCategory.getAttribute('name');
                var eImg = xmlCurrentCategory.getAttribute('img');
                var eCols = xmlCurrentInfo.getAttribute('cols');
                var eColsSet = xmlCurrentInfo.getAttribute('set');
                
                // CREATE AND POPULATE NEW OBJECT FOR CURRENT CATEGORY
                var newCategory = new Category(eName, eImg, eCols, eColsSet, xmlCurrentThemes.children);               
                // ADD CATEGORY TO GLOBAL LIST
                categoriesList.push(newCategory);
                categoriesListDefault.push(newCategory);

                // ADD ARRAY TO STORE ALL THEMES FROM CURRENT CATEGORY
                categoriesThemes[currentImportedCategory] = new Array();

                // IMPORT CONTENT OF EACH THEME FROM THE CATEGORY
                var currentTheme = 0;
                var themesLength = newCategory.themes.length;
                
                // IMPORT THEME BY THEME INTO CATEGORIES ARRAY
                function importTheme(){   

                    // STORAGE CURRENT CATEGORY DATA
                    var themeURL = newCategory.themes[currentTheme].getAttribute('url');
                    categoriesThemes[currentImportedCategory][currentTheme] = new Array();
                    
                    // LOAD THEME'S XML
                    Papa.parse(themeURL, {
                        download: true,
                        skipEmptyLines: true,
                        complete: function(results) {

                            var resultsArray = results.data;
                            
                            // POPULATE XML CONTENT OF CURRENT THEME               
                            for (var j = 0; j < resultsArray[0].length; j++)
                            {
                                // CREATE NEW ARRAY INSIDE CATEGORY'S MAIN ARRAY
                                categoriesThemes[currentImportedCategory][currentTheme][j] = new Array();

                                for(var i = 0; i < resultsArray.length; i++){
                                    // ADD CONTENT TO ONE OF CATEGORY'S ARRAY
                                    categoriesThemes[currentImportedCategory][currentTheme][j].push(resultsArray[i][j]);
                                }
                                
                            }
                            
                            // CHECK IF LOOP NEEDS TO GO ON
                            if(currentTheme < themesLength - 1){

                                currentTheme++; 
                                importTheme();

                            }
                            else if(currentImportedCategory < categoriesLength - 1){
                                
                                currentImportedCategory++;
                                importNewCategory();
                                
                            } else {
                                UIController.createMainScreen();
                            }
                        }
                    });
                }

                // START THEME LOOP
                importTheme();
                
            }
            
            // START CATEGORY LOOP
            importNewCategory();
        },
        
        // UPDATE CONTENT
        updateContent: function(categoryID){
            
            // CLEAR CURRENT CONTENT ARRAY
            currentContent = [];
            
            // CHECK ACTIVE THEMES
            var columnList = String(categoriesList[categoryID].columns).split(',');
            var themeList = categoriesList[categoryID].themes;
            
            // CREATE ARRAY SLOTS FOR CURRENT CONTENT ARRAY
            for(var c = 0; c < columnList.length; c++){
                currentContent[c] = new Array();                                
            }
            
            // LOOP THROUGH EACH THEME OF CATEGORY
            for(var i = 0; i < themeList.length; i++){
                
                // CHECK IF CURRENT THEME IS ACTIVE
                if(Number(themeList[i].getAttribute('active')) === 1){
                    
                    // IF ACTIVE, CONCAT IT'S CONTENT TO CURRENT CONTENT ARRAY
                    for(var j = 0; j < columnList.length; j++){
                        currentContent[j] = currentContent[j].concat(categoriesThemes[categoryID][i][j]);
                    }
                    
                }
                
            }
            
        },
        
        // CREATE NEW SUGGESTION
        createSuggestion: function(category){
            
            currentCategory = category;
            // SET CURRENT CATEGORY
            var currentSet = String(category.columnsSet).split(',');
            suggestionUI = '';
            
            // POPULATE SLOTS
            for (var i = 0; i < currentSet.length; i++){
                
                suggestionUI += '<span class="block' + i + '">';
                currentSuggestion[i] = new Array();
                
                // CHECK IF CATEGORY'S BLOCK HAS QUANTITY
                if(Number(currentSet[i]) > 0)
                {
                    for(var j = 0; j < Number(currentSet[i]); j++){
                        
                        var optionResult = dataController.pickOption(currentContent[i], i);
                        currentSuggestion[i].push(optionResult);
                        suggestionUI += '<span class="type' + i + '">' + optionResult + '</span> ';
                        
                    }
                }
                
                suggestionUI += '</span>';
            }
            
            UIController.displaySuggestion();
            
        },
        
        // PICK ALL OPTIONS FOR CURRENT SUGGESTION
        pickOption: function(e, id){
            
            var currentOption = e;
            var chosenOption; 
            
            function choseOption(){
                
                chosenOption = currentOption[Math.floor(Math.random() * currentOption.length)];
                
                // VALIDATE IF IT HAS DUPLICATE
                if(currentSuggestion[id].indexOf(chosenOption) !== -1){
                    choseOption();
                }
                // VALIDATE IF IT'S EMPTY
                if(chosenOption === ''){
                    choseOption();
                }
            }
            
            choseOption();
            
            return chosenOption;
            
        },
        
        // UPDATE CURRENT SUGGESTIOn
        updateCurrentSuggestion: function(id, add, content){
            
            if(add) {
                currentSuggestion[id].push(content);
            } else {
                currentSuggestion[id].splice(currentSuggestion[id].length - 1, 1);
            }
                        
        },
        
        // RETURN CATEGORIES LIST
        getCategoriesList: function(){
            return categoriesList;
        },
        
        // GET CURRENT SUGGESTION
        getCurrentSuggestion: function(){
            
            return suggestionUI;
            
        },
        
        // GET CURRENT CATEGORY
        getCurrentCategory: function(){
            return currentCategory;
        },
        
        // GET CURRENT CONTENT
        getCurrentContent: function(){
            return currentContent;
        }
        
    }
    
})();

/*

APP CONTROLLER

*/

var appController = (function(){
    
    var DOM = UIController.getDOM();
    
    var setEventListeners = function(){
        
        
        // REMAKE SUGGESTION
        $select(DOM.btnRemake).addEventListener('click', UIController.remakeSuggestion);
        
        // BACK
        $select(DOM.btnBack).addEventListener('click', UIController.returnMainScreen);
        
        $select(DOM.btnInfo).addEventListener('mouseover', function(){showMenuBox('.info_box', '60px')});
        $select(DOM.btnInfo).addEventListener('mouseleave', hideAllBoxes);
        $select(DOM.btnSupport).addEventListener('mouseover', function(){showMenuBox('.support_box', '60px')});
        $select(DOM.btnSupport).addEventListener('mouseleave', hideAllBoxes);
        
        // BUTTON SUPPORT BOX
        $select(DOM.btnSupport).addEventListener('click', function(){
            var win = window.open('https://iconicnetwork.typeform.com/to/dZ8RTb', '_blank');
            win.focus();    
        });
        
    }
    
    var showMenuBox = function(e, posY){
        
        var element = $select(e);
        
        hideAllBoxes(element);
        element.style.display = 'block';
        Velocity(element, 'stop');
        Velocity(element, { top: posY },{delay: 0, easing: "easeOutExpo", duration: 800});
        
    }
    
    var hideAllBoxes = function(e){
        
        var elementInfo = $select(DOM.infoBox);
        var elementSupport = $select(DOM.supportBox);
        var elements = [elementInfo, elementSupport];
        var elementsToAnimate = [];
        
        for(var i = 0; i < elements.length; i++){
            
            if(e !== elements[i]){
                Velocity(elements[i], 'stop');
                elementsToAnimate.push(elements[i]);
            }
            
        }
        
        Velocity(elementsToAnimate, { top: '-250px' },{delay: 0, easing: "linear", duration: 300, complete: function(){
            
            for(var j = 0; j < elementsToAnimate.length; j++){
                elementsToAnimate[j].style.display = 'none';
            }
            
        }});
            
    }
    
    return {
        
        init: function(){
          
            dataController.importContent();
            setEventListeners();
        
        },

    }
    
})();

appController.init();







