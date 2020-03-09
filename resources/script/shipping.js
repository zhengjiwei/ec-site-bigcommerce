function insert_shipping_to_checkout(index){
	let data = {};
	if(index == ""){
		data.last_name = document.getElementsByName("last_name")[0].value;
		data.first_name = document.getElementsByName("first_name")[0].value;
		data.postal_code = document.getElementsByName("user_zip_first")[0].value + "-" + document.getElementsByName("user_zip_last")[0].value;
		data.phone = document.getElementsByName("user_phone")[0].value;
		data.country = document.getElementById("country_select").selectedOptions[0].text;
		data.country_code = document.getElementById("country_select").selectedOptions[0].value;
		if(document.getElementById("province_select").style.display == "inline"){
			data.state_or_province = document.getElementById("province_select").selectedOptions[0].text;
			data.state_or_province_code = document.getElementById("province_select").selectedOptions[0].value;
		}else{
			data.state_or_province = document.getElementById("province_input").text;
			data.state_or_province_code = "";
		}
		data.address1 = document.getElementsByName("user_address1")[0].value;
		data.address2 = document.getElementsByName("user_address2")[0].value;
		data.city = document.getElementsByName("user_city")[0].value;
		data.company = document.getElementsByName("user_company")[0].value;
		data.email=document.getElementsByName("user_email")[0].value;

		let user = get_value_from_cookie("customer_token");
		if(user){
			//登録
			if(document.getElementById("save_address").checked){
				add_customer_address(data, function(result){
				});
			}
		}
	}else{
		data.last_name = document.getElementById("last_name_" + index).innerHTML;
		data.first_name = document.getElementById("first_name_" + index).innerHTML ;
		data.postal_code=document.getElementById("zip_" + index).innerHTML;
		data.phone= document.getElementById("phone_" + index).innerHTML;
		data.country=document.getElementById("country_" + index).innerHTML;
		data.country_code=document.getElementById("country_code_" + index).innerHTML;
		data.state_or_province=document.getElementById("province_" + index).innerHTML;
		data.state_or_province_code=document.getElementById("province_code_" + index).innerHTML;
		data.address1=document.getElementById("address1_" + index).innerHTML;
		data.address2=document.getElementById("address2_" + index).innerHTML;
		data.company=document.getElementById("company_" + index).innerHTML;
		data.city=document.getElementById("city_" + index).innerHTML;
		data.state_or_province_code = "";
	}
	//checkoutの情報を記入
	let cart_id = get_value_from_cookie("cart_id");
	add_shipping_address_to_checkout(cart_id, data, function(result){
				//window.location.href=document.getElementById("shipping_form").action;
				var now = new Date();
				var time = now.getTime();
				var expireTime = time + 30*24*1000*3600;
				now.setTime(expireTime);
				document.cookie="order_token=" + encodeURIComponent(result.data.id) + "; Path=/; Expires=" + now.toGMTString();
				window.location.href = document.getElementById("shipping_form").action;
	});
}

if(document.getElementById("registered_shipping_address")){
	let user = get_value_from_cookie("customer_token");
	if(user){
		get_customer_addresses(function(result){
			let addresses = result.data;
			let list = [];
			for(let i=0; i<addresses.length; i++){
				list.push("<div id=\"saved_address_"+i+"\" style=\"text-align:left; border:solid 1px lightgray; padding:10px; margin-bottom:10px; width: 450px\">\n" +
            "<div><span id=\"last_name_"+i+"\">"+ addresses[i].last_name +"</span><span id=\"first_name_"+i+"\">"+ addresses[i].first_name +"</span><input type=\"button\" name=\"delete_address\" alt=\""+i+"\" value=\"X\" height=\"20px\" style=\"float:right\"/></div>\n" +
            "<div id=\"zip_"+i+"\">"+ addresses[i].postal_code +"</div>\n" +
            "<div id=\"country_"+i+"\">"+ addresses[i].country +"</div>\n" +
            "<div id=\"country_code_"+i+"\" style=\"display:none\">"+ addresses[i].country_code +"</div>\n" +
            "<div id=\"province_"+i+"\">"+ addresses[i].state_or_province +"</div>\n" +
            "<div id=\"province_code_"+i+"\" style=\"display:none\">"+ addresses[i].state_or_province_code +"</div>\n" +
            "<div id=\"city_"+i+"\">"+ addresses[i].city +"</div>\n" +
            "<div id=\"address1_"+i+"\">"+ addresses[i].address1 +"</div>\n" +
            "<div id=\"address2_"+i+"\">"+ addresses[i].address2 +"</div>\n" +
            "<div id=\"company_"+i+"\">"+addresses[i].company+"</div>\n" +
            "<div id=\"phone_"+i+"\">"+addresses[i].phone+"</div>\n" +
            "<div id=\"addressId_"+i+"\" style=\"display:none\">"+addresses[i].id+"</div>\n" +
            "<input type=\"button\" name=\"saved_address\" id=\"delivery_"+i+"\" class=\"checkout-button\" value=\"この住所に届く\" />\n" +
            "</div>\n");
			}
	        document.getElementById("registered_shipping_address").innerHTML= list.join("\n");

			if($('input[name="saved_address"]').length>0){
				$('input[name="saved_address"]').click(function(e){
					let index = e.target.id.split("_")[1];
					insert_shipping_to_checkout(index);
				})
			}

			if($('input[name="delete_address"]').length>0){
				$('input[name="delete_address"]').click(function(e){
					let index =e.target.alt;
					delete_customer_address(document.getElementById("addressId_"+index).innerHTML, function(result){
							document.getElementById("saved_address_" + index).style.display = "none";
					});
				})
			}
		});
        document.getElementById("div_save_address").style.display="block";
	}
}

if(document.getElementById("country_select")){
	get_shipping_countries(function(result){
		if(result.length > 0){
			var list = [];
			result.forEach(item=>{
				let country_name = item.name;
					list.push("<option value=\""+ item.locations[0].country_iso2 +"\">"+ country_name +"</option>");
			});
		   document.getElementById("country_select").innerHTML = list.join("\n");

    $("#country_select").on('change', function(event){
        document.getElementById("province_select").innerHTML = "";
        let target = event.target.options;
        let iso2 = target[target.selectedIndex].value;
		get_states_of_country(iso2, function(result){
		    if(result && result.length > 0){
                let provinces = result;
                let list = [];
                for(let i=0; i< provinces.length; i++){
					list.push("<option id=\"p_" + provinces[i].id + "\" value=\""+ provinces[i].state_abbreviation +"\">"+provinces[i].state +"</option>");
                }
                document.getElementById("province_select").innerHTML = list.join("\n");
                document.getElementById("province_select").style.display = "inline";
                document.getElementById("province_input").style.display = "none";
            }else{
                document.getElementById("province_select").style.display = "none";
                document.getElementById("province_input").style.display = "inline";
            }
		});
    });



		}else{
			alert(result.data);
		}
	});
}
