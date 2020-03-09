let cart_id = get_value_from_cookie("cart_id");
get_checkout_info(cart_id, function(result){
		if(result){
			let address = result.consignments[0].shippingAddress;
			let email = result.cart.email;
			if(address.email){
				email = address.email;
			}
			let strAddress =  "<div><span>氏名：</span>"+ address.firstName +"&nbsp"+ address.lastName +"</div>";
			strAddress += "<div><span>Email："+ email+"</div>";
			strAddress += "<div><span>会社名："+ address.company +"</div>";
			strAddress += "<div><span>住所：</span>";
			strAddress += address.address2=="" ?  "" : address.address2+",&nbsp";
			strAddress += address.address1=="" ?  "" : address.address1+",&nbsp";
			strAddress += address.city + ",&nbsp" + address.stateOrProvince+",&nbsp"+address.country +"</div>";
			strAddress +="<div>"+ address.postalCode +"</div>";
			strAddress +="<div><span>電話番号：</span>"+ address.phone +"</div>";
			document.getElementById("shipping_address").innerHTML =strAddress;
			let items = result.cart.lineItems;
			let list = [];
			let currencyCode = result.cart.currency.code;
			Object.keys(items).forEach(function(index){
				let item = items[index];
				for(let i=0; i<item.length; i++){
					list.push("<img src=\""+ item[i].imageUrl+"\" width=\"50px\"><span>x"+ item[i].quantity +"</span>");
				}
			});
			document.getElementById("all_order_products").innerHTML = list.join("<span style=\"margin:10px\">+</span>") + "=" + number_to_currency(result.subtotal, result.cart.currency.code);
			document.getElementById("shipping_fee").innerHTML = "<img src=\"https://icooon-mono.com/i/icon_16219/icon_162190_256.png\" width=\"50px\">（送料）"+ number_to_currency(result.shippingCostTotal, result.cart.currency.code);
			document.getElementById("products_tax").innerHTML = "税金：" + number_to_currency(result.taxTotal, result.cart.currency.code);
			document.getElementById("total_price").innerHTML = "合計："+ number_to_currency(result.grandTotal, result.cart.currency.code);
		}
	});

let order_id=get_value_from_cookie("order_token");
get_payment_methods(order_id, function(result){
	let data = result.data;
	if(data && data.length>0){
		data.forEach(function(payment){
			if(payment.type == "card"){
				document.getElementById("payment_card").style.display = "block";
				let types = [];
				payment.supported_instruments.forEach(function(type){
					types.push(type.instrument_type);
				});
				document.getElementById("card_types").innerHTML = payment.name + ":" + types.join("/");
			}
		});
	}
});

if(document.getElementById('card_expires_year')){
    var select = document.getElementById('card_expires_year');
    var year = parseInt(new Date().getFullYear());
    for(var i=0; i < 20; i ++){
        var option = document.createElement("option");
        option.text = year + i;
        option.value = year + i;
		if(i == 2){
			option.selected = "selected";
		}
        select.appendChild(option);
    }
}

function add_payment_info(){
	let card = {};
	card.verification_value=document.getElementById("card_code").value;
	card.expiry_month = parseInt(document.getElementById("card_expires_month").value);
	card.expiry_year = parseInt(document.getElementById("card_expires_year").value);
	card.number = document.getElementById("card_number").value;
	card.cardholder_name = document.getElementById("card_user_name").value;
	add_payment_to_order("card", card,  function(result){
		if(result.data){
			window.location.href = document.getElementById("payment_form").action;
		}
	});
}
