let items_db;
let all_items ="";
let base_api_url = "https://west.albion-online-data.com/api/v2/stats/Prices/";
let image_base_url = "https://render.albiononline.com/v1/item/";

$(document).ready(()=>{
    
    console.log("Items start loading");
    $.getJSON("https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json",
    function(json){
        
        items_db=json;
        console.log("Items end loading");
        update_select();
        
        $('.basicAutoComplete').autoComplete({
            resolverSettings: {
                url: items_db
            }
        });    
        
    }).fail(function(){
        console.log("An error has occurred.");
    });;
    
    
})

function update_select(){
    items_db.forEach(element => {
        
        if (element["LocalizedNames"]!= null){
            let UniqueName = element.UniqueName;
            let Name = element["LocalizedNames"]["RU-RU"];
            
            let regex = /T(\d+)(?:_.*?)*(?:@(\d+))$/;
            let matches = regex.exec(UniqueName);
            
            if (matches) {
                let itemLevel = matches[1]; // Уровень предмета
                let enchantmentLevel = matches[2]; // Уровень зачарования (если есть)
                
                if (itemLevel) Name+=", уровень " + itemLevel;
                if (enchantmentLevel) Name+=", зачарование " + enchantmentLevel;
            }
            
            let html_element = $("<option></option>").text(Name);
            html_element.val(UniqueName);
            
            $("#items_list").append(html_element);
            all_items += UniqueName + ",";
        }
        
    });
}

function search() {
    $("#search_result").empty();
    let objects_to_find = [];
    
    $("#searcher_objects div").each( function(){
        let name = $(this).attr("item_name");
        objects_to_find.push(name);
    });
    
    objects_to_find.forEach(element => {
        let query = base_api_url + element + "?locations="+$("#city_start").val()+","+$("#city_end").val();

        $.getJSON(query, function(data){
            console.log(data);
            let lastTimestampStart = data[0].sell_price_min_date;
            lastTimestampStart = minute_diff(lastTimestampStart);
            let avgPriceStart = data[0].sell_price_min;

            let lastTimestampEnd = data[1].sell_price_min_date;
            lastTimestampEnd = minute_diff(lastTimestampStart);
            let avgPriceEnd = data[1].sell_price_min;

            if ($("#city_start").val()!=data[0].city){
                let timestamp = lastTimestampStart;
                lastTimestampStart = lastTimestampEnd;
                lastTimestampEnd = timestamp;

                let price = avgPriceStart;
                avgPriceStart = avgPriceEnd;
                avgPriceEnd = price;
            }
            
            add_object({element,lastTimestampStart,avgPriceStart,lastTimestampEnd,avgPriceEnd});
        });
    });
    
}

function add_to_search(){
    let item = $("#items").val();
    $("#items").val('');
    let img = "<div class='col-auto position-relative' item_name='"+item+"'><img src='"+image_base_url+item+"' width='120px'><button onclick='remove_item(this)' class='btn btn-danger position-absolute translate-middle rounded-pill' style='top:15%; right:0%;'><i class='bi bi-x'></i></button></div>";
    
    $("#searcher_objects").append(img);
}

function remove_item(element){
    $(element).closest('div.col-auto').remove();
}

function minute_diff(targetDate){
    var currentDate = new Date();
    targetDate = new Date(targetDate);
    var timeDiff = targetDate.getTime() - currentDate.getTime();
    return Math.floor(timeDiff / (1000 * 60));
}

function add_object(obj){

    let row = $("<div class='row align-items-center'></div>");

    console.log(obj);
    let img = $("<div class='col'></div>").html("<img src='"+image_base_url+obj.element+"' width='120px'>");
    let startPrice = $("<div class='col'></div>").text(obj.avgPriceStart);
    let lastTimestampStart = $("<div class='col'></div>").text(obj.lastTimestampStart+" минут назад");
    let endPrice = $("<div class='col'></div>").text(obj.avgPriceEnd);
    let lastTimestampEnd = $("<div class='col'></div>").text(obj.lastTimestampEnd+" минут назад");

    let profit_amount = obj.avgPriceEnd - obj.avgPriceStart;
    let profit = $("<div class='col fw-bold'></div>").text(profit_amount);

    if (profit_amount<=0) profit.addClass("text-danger");
    if (obj.lastTimestampEnd<=-300) lastTimestampEnd.addClass("text-danger");
    if (obj.lastTimestampStart<=-300) lastTimestampStart.addClass("text-danger");

    row.append(img);
    row.append(startPrice);
    row.append(lastTimestampStart);
    row.append(endPrice);
    row.append(lastTimestampEnd);
    row.append(profit);

    $("#search_result").append(row);
}