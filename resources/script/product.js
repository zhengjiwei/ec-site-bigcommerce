function change_image(el){
    document.getElementById("image-main").src = el.src;
}

function update_cart_info(result){
	let count = 0;
	let physical = result.lineItems.physicalItems;
	let digital = result.lineItems.giftCertificates;
	physical.forEach(item=>{
		count += item.quantity;
	});
	digital.forEach(item=>{
		count += item.quantity;
	});
	document.getElementById("checkout_items_count").innerText = count;
}

function put_to_cart(){
    let vid = document.getElementById("selected_product").value;
	vid = atob(vid).split(":")[1];
	let productId =  atob(pid).split(":")[1];
    let count = document.getElementById("selected_count").value;
	let count_in_cart = document.getElementById("checkout_items_count").innerText;
	get_cart_info(function(info){
		if(info.length == 0 || info.error == "no cookie"){
			create_cart(productId, vid, count, function(result){
				let customer_token = get_value_from_cookie("customer_token");
				if(customer_token){
					set_customerid_to_cart(result.id);
				}
					write_cookie("cart_id", result.id);
					update_cart_info(result);
				});
		}else{
			push_to_cart(info[0].id, productId, vid, count, function(result){
				update_cart_info(result);
			});
		}
	});
}

function callback_write_review(data){
	document.getElementById("review_form").innerHTML = data.form;
	$(".new-review-form").attr("action", 'javascript:write_review('+pid+')');
	$(".new-review-form").removeAttr("onsubmit");
}

function write_review(pid){
	let name = $("#review_author_" +pid).val();
	let email = $("#review_email_" +pid).val();
	let title = $("#review_title_" +pid).val();
	let text = $("#review_body_" +pid).val();
	let rate = 5 - $(".spr-form-review-rating").find(".spr-icon-star-empty").length;

	write_review_by_product_id(pid, name, email, rate, title, text, "callback_write_review");
}

function get_product_by_product_id(pid){
	get_product(pid, function(result){
       let info = result.site.product;
        let images = info.images.edges;
        document.getElementById("image-main").src= info.defaultImage.url;
        let output = [];
        for(var i=0; i<(images.length > 5 ? 5 : images.length); i++){
            output.push("<div><img src=\""+ images[i].node.url +"\" class=\"image-size-small image-link\" onClick=\"change_image(this)\"></div>");
        }
        document.getElementById("vertical_images").innerHTML = output.join("");
        output = [];
        for(var i=5; i<images.length; i++){
            output.push("<div style=\"float:left\"><img src=\""+ images[i].node.url +"\" class=\"image-size-small image-link\" onClick=\"change_image(this)\"></div>");
        }
        document.getElementById("horizontal_images").innerHTML = output.join("");

        document.getElementById("product_description").innerHTML = info.description;
        document.getElementById("product_title").innerHTML = info.name;

        let options = info.options.edges;
        let output_select = [];
        if(options.length != 0){
            for(var i=0; i<options.length; i++){
                output_select.push("<lable>" + options[i].node.displayName + "</lable>");
                output_select.push("<select name='product_selector' id='"+ options[i].node.entityId+"'>");
				let list = options[i].node.values.edges;
                for(var j=0; j<list.length; j++){
                    output_select.push("<option value='"+list[j].node.entityId +"'>"+ list[j].node.label +"</option>");
                }
                output_select.push("</select>");
            }
            document.getElementById("select-options").innerHTML = output_select.join("");
        }

        let variants = info.variants.edges;
        let currencyCode = info.prices.price.currencyCode;

        if($("[name=product_selector]").length > 0){
            $("[name=product_selector]").change(function(e){
                let obj = document.getElementsByName("product_selector");
                let selected = [];
                for(let i=0; i<obj.length; i++){
                    selected[obj[i].id] = obj[i].value;
                }
                let target = "";
                for(let i=0; i<variants.length; i++){
                    let targetOptions = variants[i].node.options.edges;
					let j = 0;
					for(j=0; j<targetOptions.length; j++){
						if(selected[targetOptions[j].node.entityId] != targetOptions[j].node.values.edges[0].node.entityId){
							break;
						}
					}
					if(j == targetOptions.length){
						target = variants[i].node;
						break;
					}
                }
                document.getElementById("selected_product").value = target.id;
                
                document.getElementById("current_price").innerHTML = "価格：" + get_price_html(variants[i], currencyCode);
				if(true){
					document.getElementById("pick-up").disabled = "";
					document.getElementById("selected_count").value = "1";
				}else{
					document.getElementById("pick-up").disabled = "disabled";
					document.getElementById("selected_count").value = "Sold out";
				}
            });
            $("[name=product_selector]")[0].dispatchEvent(new Event('change'));
        }else{
            document.getElementById("selected_product").value = variants[0].node.id;
            document.getElementById("current_price").innerHTML = "価格：" + get_price_html(variants[0], currencyCode);
        }
	});
}

let pid=decodeURIComponent(get_url_parameter( window.location.href, "pid"));
if(pid != ""){
	get_product_by_product_id(pid);
	get_cart_info(function(result){
		if(result.length > 0){
			update_cart_info(result[0]);
		}
	});
}