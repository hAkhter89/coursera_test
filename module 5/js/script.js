$(function () {
    $(".navbar-toggle").blur(function (event) {
        let screenWidth = window.innerWidth;
        if (screenWidth < 768) {
            $("#collapsable-nav").collapse('hide');
        }
    });
});

(function (global) {
    let dc = {};
    let homehtml = "./snippets/home-snippet.html";
    let allcategoriesurl = "https://davids-restaurant.herokuapp.com/categories.json"
    let categoriestitlehtml = "snippets/categories-tile-snippet.html";
    let categoryhtml = "snippets/category-snippet.html";
    let menuitemsurl = "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
    let menuitemstitlehtml = "snippets/menu-items-title.html";
    let menuitemhtml = "snippets/menu-item.html"

    // funtion for inserting innerHTML for 'select'
    let inserthtml = function (selector, html) {
        let targetelem = document.querySelector(selector);
        targetelem.innerHTML = html;
    };

    let showloading = function (selector) {
        let html = "<div class='text-center'>";
        html += "<img src='images/ajax-loader.gif'></div>";
        inserthtml(selector, html);
    };
    let insertproperty = function (string, propName, propValue) {
        let propToReplace = "{{" + propName + "}}";
        string = string.replace(new RegExp(propToReplace, "g"), propValue);
        return string
    }

    var switchMenuToActive = function () {
        // Remove 'active' from home button
        let classes = document.querySelector("#navHomeButton").className;
        classes = classes.replace(new RegExp("active", "g"), "");
        document.querySelector("#navHomeButton").className = classes;
      
        // Add 'active' to menu button if not already there
        classes = document.querySelector("#navMenuButton").className;
        if (classes.indexOf("active") == -1) {
          classes += " active";
          document.querySelector("#navMenuButton").className = classes;
        }
    };

    // MY SOLUTION TO THE PROBLEM


    document.addEventListener("DOMContentLoaded", function (event) {
        showloading("#main-content");
        $ajaxUtils.sendGetRequest(homehtml, function (homesnippet) {
            $ajaxUtils.sendGetRequest(allcategoriesurl, HomeHTMLView)
            function HomeHTMLView(categories) {
                randomindexshortname = categories[Math.floor(Math.random() * 19)].short_name
                console.log(randomindexshortname)
                newhomesnippet = insertproperty(homesnippet, 'randomCategoryShortName', randomindexshortname)
                inserthtml("#main-content", newhomesnippet)
                

            }
        }, false);
    });
    // SOLUTION END

    dc.loadMenuCategories = function () {
        showloading("#main-content");
        $ajaxUtils.sendGetRequest(allcategoriesurl, buildAndShowCategoriesHTML);
    };

    dc.loadMenuItems = function (CategoryShort) {
        showloading("#main-content");
        $ajaxUtils.sendGetRequest(menuitemsurl + CategoryShort, buildAndShowMenuItemsHTML);
    };

    function buildAndShowCategoriesHTML(categories) {
        $ajaxUtils.sendGetRequest(categoriestitlehtml,
            function (categoriestitlehtml) {
                $ajaxUtils.sendGetRequest(categoryhtml, function (categoryhtml) {
                    let categoriesviewhtml = buildCategoriesViewHtml(categories, categoriestitlehtml, categoryhtml);
                    inserthtml('#main-content', categoriesviewhtml);
                    switchMenuToActive();
                }, false);

            }, false);
    }

    function buildCategoriesViewHtml(categories, categoriestitlehtml, categoryhtml) {
        let finalHtml = categoriestitlehtml;
        finalHtml += "<section class='row'>";

        for (let i = 0; i < 20; i++) {
            let html = categoryhtml;
            let name = '' + categories[i].name;
            let short_name = categories[i].short_name;
            html = insertproperty(html, "name", name);
            html = insertproperty(html, "short_name", short_name);
            finalHtml += html;
        }
        finalHtml += "</section>";
        return finalHtml;

    }

    function buildAndShowMenuItemsHTML(categoryMenuItems) {
        $ajaxUtils.sendGetRequest(menuitemstitlehtml, function (menuitemstitlehtml) {
            $ajaxUtils.sendGetRequest(menuitemhtml, function (menuitemhtml) {
                let menuitemsviewhtml = buildMenuItemsViewHtml(categoryMenuItems, menuitemstitlehtml, menuitemhtml);
                inserthtml("#main-content", menuitemsviewhtml)
                switchMenuToActive();
            }, false)
        }, false)
    }

    function buildMenuItemsViewHtml(categoryMenuItems, menuitemstitlehtml, menuitemhtml) {
        menuitemstitlehtml = insertproperty(menuitemstitlehtml, "name", categoryMenuItems.category.name);
        menuitemstitlehtml = insertproperty(menuitemstitlehtml, "special_instructions", categoryMenuItems.category.special_instructions);

        let finalHtml = menuitemstitlehtml;
        finalHtml += "<sections class='row'>";

        let menuItems = categoryMenuItems.menu_items;
        let catShortName = categoryMenuItems.category.short_name;
        for (let i = 0; i < menuItems.length; i++) {

            let html = menuitemhtml;
            html = insertproperty(html, "short_name", menuItems[i].short_name);
            html = insertproperty(html, "catShortName", catShortName);
            html = insertItemPrice(html, "price_small", menuItems[i].price_small);
            html = insertItemPortionName(html, "small_portion_name", menuItems[i].small_portion_name);
            html = insertItemPrice(html, "price_large", menuItems[i].price_large);
            html = insertItemPortionName(html, "large_portion_name", menuItems[i].large_portion_name);
            html = insertproperty(html, "name", menuItems[i].name);
            html = insertproperty(html, "description", menuItems[i].description);

            if (i % 2 != 0) {
                html += "<div class='clearfix visible-lg-block visible-md-block'></div>";
            }

            finalHtml += html;
        }

        finalHtml += "</section>";
        return finalHtml

        switchMenuToActive();
    }

    function insertItemPrice(html, pricePropName, priceValue) {
        if (!priceValue) {
            return insertproperty(html, pricePropName, "");
        }
        priceValue = "$" + priceValue.toFixed(2);
        html = insertproperty(html, pricePropName, priceValue);
        return html;
    }

    function insertItemPortionName(html, portionPropName, portionValue) {
        if (!portionValue) {
            return insertproperty(html, portionPropName, "");
        }

        portionValue = "(" + portionValue + ")";
        html = insertproperty(html, portionPropName, portionValue);
        return html;
    }


    global.$dc = dc;
})(window);