function set_wait_cursor(type){
	if(type){
		document.body.style.cursor = "wait";
		Array.from(document.querySelectorAll('input')).map(function(button) { button.style.cursor="wait";})
	}else{
		document.body.style.cursor = "default";
		Array.from(document.querySelectorAll('input')).map(function(button) { button.style.cursor="default";})
	}
}

function delete_cookie(name) {
  document.cookie = name + "=; path=/; expires=0; max-age=-1";
}

function number_to_currency(total, currencyCode){
	return Number(total).toLocaleString('ja-JP', { style: 'currency', currency: currencyCode, minimumFractionDigits: 2, maxmumFractionDigits: 2});
}

function write_cookie(name, value){
	var now = new Date();
	var time = now.getTime();
	var expireTime = time + 30*24*1000*3600;
	now.setTime(expireTime);
	document.cookie= name + "=" + value + "; Path=/; Expires=" + now.toGMTString();
}

function get_value_from_cookie(key) {
  let cookies = document.cookie.split(";");
  let result = "";
  cookies.forEach(item => {
    item = item.trim();
    let currentCookie = item.split("=");
    if (currentCookie[0] == key) {
      result = currentCookie[1];
    }
  });
  return decodeURIComponent(result);
}

function get_url_parameter(url, target) {
  var regex = new RegExp("[?&]" + target + "(=([^&#]*)|&|#|$)");
  let results = regex.exec(url);
  if (!results) {
    return "";
  } else if (results[2]) {
    return results[2];
  } else {
    return "";
  }
}

function http_get_common(url, data, callback) {
  $.ajax({
    type: 'POST',
    timeout: 50000,
    url: url,
    headers: {
      "Content-Type": "application/json",
    },
    crossDomain: true,
    data: data,
    dataType: 'json',
    cache: false,
  }).done(function(result) {
    callback(result);
  }).fail(function(error) {
    callback(error)
  })
}

function http_get_by_server_sync(url, input,callback){
		$.ajax({type: 'POST',
            url: url,
			data:input,
            dataType: 'json',
            timeout: 50000,
            cache: false,
            async:false
	   }).done(function(result, status, xhr){
            callback(result);
        }).fail(function(result, status, xhr){
            console.log(result);
			alert(result.responseText);
        });
}

function http_get_by_server(url, input, callback){
	set_wait_cursor(true);
	$.ajax({type: 'POST',
			url: url,
			data:input,
			dataType: 'json',
			timeout: 50000,
			cache: false,
	 }).done(function(result, status, xhr){
		set_wait_cursor(false);
		callback(result);
	}).fail(function(result, status, xhr){
		set_wait_cursor(false);
		console.log(url);
		console.log(input);
		console.log(result);
		alert(result.responseText);
	});
}

function get_categories(callback){
	http_get_by_server("/bigcommerce/graphql/query",{"method": "get", "data": JSON.stringify({"query": "query queryCategories {site { categoryTree {  name  path  description  productCount  entityId }}}"})}, callback);
}

function get_category_info(id, callback){
	http_get_by_server("/bigcommerce/graphql/query", {"method": "get", "data": JSON.stringify({"query":"query queryCategory { node(id:\""+btoa("Category:"+id)+"\") { ... on Category{ name path description defaultImage{ url(width:100, height:100) } } }}"})}, callback);
}

function get_products_list_in_category(cid, limit, direction,cursor, callback){
	let str_query = "query queryProducts { node(id:\""+btoa("Category:"+cid)+"\") { ... on Category{ name path description defaultImage{ url(width:100, height:100) } products(";
	if(direction == "after"){
		str_query += "first:" + limit + ", "+direction+":\""+cursor+"\"";
	}else if(direction == "before"){
		str_query += "last:" + limit + ", "+direction+":\""+cursor+"\"";
	}else{
		str_query += "first:"+limit;
	}
	str_query +="){ pageInfo{ hasNextPage hasPreviousPage startCursor, endCursor} edges{ node{ id name path description defaultImage{ url(width:100, height:100) } prices{ price{ value currencyCode } salePrice{value} retailPrice{value} }  } } }}}}";
	http_get_by_server("/bigcommerce/graphql/query", {"method":"get", "data": JSON.stringify({"query":str_query})}, callback);
}

function get_product(pid, callback){
	let str_query = "query queryProdcut { site{ product(id:\""+ pid +"\"){ id entityId name description availability prices{ price{ currencyCode value } } variants(first:20){ edges{ node{ id entityId prices{ price{ currencyCode value } salePrice{value} retailPrice{value} } options{ edges{ node{ entityId displayName values(first:2){ edges{ node{ entityId label } } } } } } } } } options(first:10){ edges{ node{ entityId displayName values(first: 20){ edges{ node{ entityId label } } } } } } defaultImage{ url(width:300, height:300) } images(first:10){ edges{ node{ url(width:300, height:300) } } } } }}";
	http_get_by_server("/bigcommerce/graphql/query", {"method":"get", "data": JSON.stringify({"query":str_query})}, callback);
}

function get_cart_info(callback){
	http_get_by_server("/bigcommerce/front/query", {"method": "get","url": "carts?include=lineItems.digitalItems.options%2ClineItems.physicalItems.options"}, callback);
}

function create_cart(pid, vid, count, callback){
	http_get_by_server("/bigcommerce/common/query", {"method": "post", "url": "carts?include=lineItems.digitalItems.options%2ClineItems.physicalItems.options","data": JSON.stringify({"lineItems": [{"productId": pid, "variantId": vid, "quantity": count}]})}, callback);
}

function set_customerid_to_cart(cart_id){
	http_get_by_server("/bigcommerce/server/query", {"method": "put", "url": "/v3/carts/" + cart_id});
}

function push_to_cart(cart_id, pid, vid, count, callback){
	http_get_by_server("/bigcommerce/front/query", {"method": "post", "url": "carts/"+ cart_id+"/items?include=lineItems.digitalItems.options%2ClineItems.physicalItems.options","data": JSON.stringify({"lineItems": [{"productId": pid, "variantId": vid, "quantity": count}]})}, callback);
}

function get_checkout_info(cart_id, callback){
	http_get_by_server("/bigcommerce/front/query", {"method": "get","url": "checkout/"+cart_id+"?include=lineItems.digitalItems.options%2ClineItems.physicalItems.options"}, callback);
}

function update_checkout_items(cart_id, item_id, pid, vid, count, callback){
	if(count <= 0){
		http_get_by_server("/bigcommerce/front/query", {"method": "delete","url": "checkouts/"+cart_id+"/carts/"+cart_id+"/items/"+item_id}, callback);
	}else{
		http_get_by_server("/bigcommerce/front/query", {"method": "put","url": "checkouts/"+cart_id+"/carts/"+cart_id+"/items/"+item_id, "data": JSON.stringify({"lineItem": {"productId": pid, "variantId": vid, "quantity": count}})}, callback);
	}
}

function get_shipping_countries(callback){
	http_get_by_server("/bigcommerce/server/query", {"method": "get","url": "/v2/shipping/zones"}, callback);
}

function get_states_of_country(iso2, callback){
	http_get_by_server("/bigcommerce/server/query", {"method": "get","url": "/v2/countries?country_iso2="+iso2}, function(result){
		let id = result[0].id;
		http_get_by_server("/bigcommerce/server/query", {"method": "get","url": "/v2/countries/"+ id +"/states"},callback);
	});
}

function add_shipping_address_to_checkout(cart_id, data, callback){
	http_get_by_server("/bigcommerce/server/query", {"method": "post","url": "/v3/checkouts/"+cart_id+"/consignments?include=consignments.available_shipping_options", "data": JSON.stringify(data)}, callback);
}

function get_order_info(id, callback){
	http_get_by_server("/bigcommerce/server/query", {"method": "get","url": "/v2/orders/"+id}, callback);
}

function get_payment_methods(order_id, callback){
	http_get_by_server("/bigcommerce/server/query", {"method": "get","url": "/v3/payments/methods?order_id="+order_id}, callback);
}

function add_payment_to_order(type, data, callback){
	http_get_by_server("/bigcommerce/server/payment", {"type": type, "data": JSON.stringify(data)}, callback);
}

function create_customer_user(email, password, first, last, callback){
	http_get_by_server("/bigcommerce/server/query", {"method": "post", "url": "/v3/customers" ,"data": JSON.stringify([{"email":email,"last_name":last,"first_name":first,"authentication":{"force_password_reset":false,"new_password": password}}])}, callback);
}

function customer_login(email, password, callback){
	http_get_by_server("/bigcommerce/server/query", {"method": "get", "url": "/v3/customers?email%3Ain="+encodeURIComponent(email)}, function(result){
		http_get_by_server("/bigcommerce/server/query", {"method": "post", "url": "/v2/customers/"+ result.data[0].id +"/validate", "data": JSON.stringify({"email": email, "password": password})}, function(result1){callback(result.data[0].id, result1)});
	});
}

function get_customer_addresses(callback){
	http_get_by_server("/bigcommerce/server/query", {"method": "get", "url": "/v3/customers/addresses"}, callback);
}

function add_customer_address(data, callback){
	http_get_by_server("/bigcommerce/server/query", {"method": "post", "url": "/v3/customers/addresses", "data": JSON.stringify(data)}, callback);
}

function delete_customer_address(id, callback){
	http_get_by_server("/bigcommerce/server/query", {"method": "delete", "url": "/v3/customers/addresses?id%3Ain=" + id, "data": "{}"}, callback);
}

function logout(callback){
	http_get_by_server("/bigcommerce/server/query", {"method": "remove", "data":JSON.stringify({"name": "customer_id"})}, callback);
}

function get_customer_orders(callback){
	let last_one_year = new Date();
	last_one_year.setFullYear(last_one_year.getFullYear() - 1);
	last_one_year = last_one_year.toISOString();
	let url =  "/v2/orders?min_date_created=" + last_one_year;
	http_get_by_server("/bigcommerce/server/query", {"method": "get", "url":url}, callback);
}

function get_order_by_id(id, callback){
	http_get_by_server("/bigcommerce/customer/orders/" + id, {}, callback);
}

function reset_customer_password(email, old_password, new_password, callback){
	customer_login(email, old_password, function(result){
		http_get_by_server("/bigcommerce/server/query", {"method": "put", "url": "/v2/customers/", "data":JSON.stringify({"_authentication": {"password": new_password, "password_confirmation": new_password}})}, callback);
	});
}

function get_price_html(data, currencyCode){
	let price = data.node.prices.price ? data.node.prices.price.value : null;
	let retailPrice = data.node.prices.retailPrice ? data.node.prices.retailPrice.value : null;
	let salePrice = data.node.prices.salePrice ? data.node.prices.salePrice.value : null;
	let str_price = "";
    if(salePrice){
        str_price = "<span>" + number_to_currency(data.node.prices.salePrice.value, currencyCode)+ "</span>";
        if(price){
            str_price = "<span style='text-decoration: line-through'>" + number_to_currency(data.node.prices.price.value, currencyCode )+ "</span>" + str_price;
        }
		if(retailPrice){
            str_price = "<span style='text-decoration: line-through'>" + number_to_currency(data.node.prices.retailPrice.value, currencyCode)+ "</span>" + str_price;
        }
    }else{
		str_price = "<span>" + number_to_currency(data.node.prices.price.value, currencyCode)+ "</span>";
		if(retailPrice){
			str_price = "<span style='text-decoration: line-through'>" + number_to_currency(data.node.prices.retailPrice.value, currencyCode) + "</span>" + str_price;
		}
    }
	return str_price;
}

function get_product_price(data){
	let price = data.node.prices.price.value;
	let retailPrice = data.node.prices.retailPrice.value;
	let salePrice = data.node.prices.salePrice.value;
	return salePrice || price || retailPrice;
}

function set_products_list(cid, limit, direction, cursor, tagId){
    get_products_list_in_category(cid, limit, direction, cursor, function(result) {
        if (result.node) {
            if(document.getElementById("topic_image")){
                document.getElementById("topic_image").src = result.node.defaultImage == null ? "" : result.node.defaultImage.url;
            }
            let data = result.node.products.edges;
            let output = [];
            for (let i = 0; i < data.length; i++) {
                let pid = data[i].node.id;
				let currencyCode = data[i].node.prices.price.currencyCode
				let str_html = "<div style=\"float:left\"><a href=\"/products/product.html?pid=" + encodeURIComponent(pid) + "\"><img src=\"" + data[i].node.defaultImage.url+ "\" class=\"image-size\"><div>";
				str_html += get_price_html(data[i], currencyCode) + "</div></a></div>"
                output.push(str_html);
            }
            output.push("<div style='clear:both'></div><br>");
            if(result.node.products.pageInfo.hasPreviousPage || direction == "after"){
 				output.push("<a href=\"javascript:set_products_list(" +cid + "," + limit + ",'before'" + ",'" + result.node.products.pageInfo.startCursor + "','"+tagId+"')\"><span style='margin-left:40px'>&lt;&lt;Prev</span></a>");
           }
            if(result.node.products.pageInfo.hasNextPage || direction == "before"){
				output.push("<a href=\"javascript:set_products_list(" + cid + ","+ limit + ",'after'"+ ",'" + result.node.products.pageInfo.endCursor + "','"+tagId+"')\"><span style='margin-left:40px'>Next&gt;&gt;</span></a>");
            }
            document.getElementById(tagId).innerHTML = output.join("");
        } else {
            alert("error");
        }
    });
}
