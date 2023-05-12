let items_db;
let all_items ="";
let base_api_url = "https://west.albion-online-data.com/api/v2/stats/prices/";
let image_base_url = "https://render.albiononline.com/v1/item/";

$(document).ready(()=>{
    
    console.log("Items start loading");
    $.getJSON("https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json",
    function(json){
        
        items_db=json;
        console.log("Items end loading");
        update_select();
        
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

function search_price() {
    $("#tableResult tr").empty();

    let item = $("#items").val() !="all" ? $("#items").val() : all_items;
    let city = $("#cities").val() != "all" ? '?locations='+$("#cities").val() : "";

    let currentDate = new Date();

    console.log(item + city);

    $.get(base_api_url+item+city, 
    function(html) {
        
        html.forEach(obj => {
            let img = "<td><img src='"+image_base_url+item+"' width='80px'></td>";
            let city_val = "<td>"+obj.city+"</td>";
            let sellPriceMin = "<td>"+obj.sell_price_min+"</td>";

            let targetDate = new Date(obj.sell_price_min_date);
            let timeDiff = targetDate.getTime() - currentDate.getTime();
            let minutesDiff = Math.floor(timeDiff / (1000 * 60));
            let color = minutesDiff < -3000 ? " class='text-danger'" : "";
            let sellPriceMinDate = "<td"+color+">"+minutesDiff+" минут назад"+"</td>";

            let buyPriceMin = "<td>"+obj.buy_price_min+"</td>";

            targetDate = new Date(obj.buy_price_min_date);
            timeDiff = targetDate.getTime() - currentDate.getTime();
            minutesDiff = Math.floor(timeDiff / (1000 * 60));
            color = minutesDiff < -3000 ? " class='text-danger'" : "";
            let buyPriceMinDate = "<td"+color+">"+minutesDiff+" минут назад"+"</td>";

            if (obj.sell_price_min > 0)
            $("#tableResult").append("<tr>"+img+city_val+sellPriceMin+sellPriceMinDate+buyPriceMin+buyPriceMinDate+"</tr>");
        });
        
    });
}