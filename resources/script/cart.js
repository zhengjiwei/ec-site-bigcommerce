//######  process cart ######
var currencyCode = "";

function update_items_into_checkout(e, callback){
	let ids = e.target.id.split("_");
	let count = e.target.value;
	update_checkout_items(ids[0], ids[1], ids[2], ids[3], count, callback);
}

function output_products_list(cart_info){
			let cart_options =[];
			if(cart_info.lineItems.physicalItems){
				cart_info.lineItems.physicalItems.forEach(item=>{
					cart_options[item.variantId] = item.options;
				});
			};
			if(cart_info.lineItems.digitalItems){
				cart_info.lineItems.digitalItems.forEach(item=>{
					cart_options[item.variantId] = item.options;
				});
			};
			if(cart_info.lineItems.giftCertificates){
				cart_info.lineItems.giftCertificates.forEach(item=>{
					cart_options[item.variantId] = item.options;
				});
			};

            get_checkout_info(cart_info.id, function (result) {
                currencyCode = result.cart.currency.code;
                let pItems = result.cart.lineItems.physicalItems;
                let dItems = result.cart.lineItems.digitalItems;
                let gItems = result.cart.lineItems.giftCertificates;
                let lists = [];

                function output_product_line(items) {
                    items.forEach(item => {
                        let title = item.name;
                        let option = "";
                        if (cart_options[item.variantId]) {
                            let op = [];
                            cart_options[item.variantId].forEach(item1 => {
                                op.push(item1.value);
                            });
                            option = op.join("&nbsp;&nbsp;x&nbsp;&nbsp;");
                        }
                        lists.push("<tr>\n" +
                            "        <td className=\"width20 valign-top\">\n" +
                            "            <div style=\"text-align:left\"><img src=\"" + item.imageUrl + "\" width=\"100px\"/></div>\n" +
                            "        </td>\n" +
                            "        <td className=\"width70 valign-top\">\n" +
                            "            <input type=\"hidden\" id=\"product_variant_" + item.variantId + "\" value=\"" + item.variantId + "\"/>\n" +
                            "            <div style=\"text-align:left\">商品名：" + title + "</div>\n" +
                            "            <div style=\"text-align:left\">商品オプション：" + option + "</div>\n" +
                            "            <div style=\"text-align:left\">単価：" + number_to_currency(item.salePrice, currencyCode) + "</div>\n" +
                            "            <div style=\"text-align:left\">数量：<input name=\"checkout_products\" id=\""+ result.cart.id + "_" + item.id +"_"+ item.productId +"_" + item.variantId + "\" alt=\"" + item.salePrice + "\" value=\"" + item.quantity + "\"/></div>\n" +
                            "        </td>\n" +
                            "        <td className=\"width10\">\n" +
                            "            <div id=\"product_variant_id_" + item.variantId + "_price\">" + number_to_currency(item.salePrice * item.quantity, currencyCode) + "</div>\n" +
                            "    </tr>");
                    });
                }
				if(pItems){
	                output_product_line(pItems);
				}
				if(dItems){
               	 output_product_line(dItems);
				}
				if(gItems){
                	output_product_line(gItems);
				}

                let total_price = number_to_currency(result.grandTotal, currencyCode);
                let total_tax = number_to_currency(result.taxTotal, currencyCode);
                lists.push("<tr>\n" +
                    "<td colspan=\"3\"><div style=\"border-top: solid 1px lightgray\"></div></td>\n" +
                    "</tr>\n" +
                    "<tr>\n" +
                    "<td class=\"width20 valign-top\"><div style=\"text-align:left\"></div></td>\n" +
                    "<td class=\"width80 valign-top\"></td>\n" +
                    "<td>税：<span id=\"all_tax\">" + total_tax + "</span>  </td>\n" +
                    "</tr>\n" +
                    "<tr>\n" +
                    "<td colspan=\"3\"><div style=\"border-top: solid 1px lightgray\"></div></td>\n" +
                    "</tr>\n" +
                    "<tr>\n" +
                    "<td></td>\n" +
                    "<td><div style=\"float:right;\">合計：</div></td>\n" +
                    "<td><span id=\"total_price\" style=\"font-size:18px\">" + total_price + "</span>（税込）</td>\n" +
                    "</tr>");
                document.getElementById("checkout_list").innerHTML = lists.join("\n");
				install_event();
            });
}

function show_prodcuts_in_cart(){
    get_cart_info(function(cart_info) {
        if (cart_info.length > 0) {
			output_products_list(cart_info[0]);
        }else{
			document.getElementById("checkout_list").innerHTML="";
		}
    });
}

function install_event(){
	if($('input[name="checkout_products"]').length>0){
		$('input[name="checkout_products"]').change(function(e){
			update_items_into_checkout(e, function(result){
				show_prodcuts_in_cart();
			});
		})
	}
}

show_prodcuts_in_cart();