(ns ecsite.handler
    (:require [compojure.core :refer :all]
      [compojure.route :as route]
      [ring.middleware.defaults :refer [wrap-defaults site-defaults]]
      [clojure.data.json :as json]
      [clojure.data.json :as json]
      [clojure.edn :as edn]
      [ecsite.storefront :as storefront]
      [clojure.java.io :as io]
      [ring.util.response :as response]
      )
    )


;パラメータは以下で取得できます。
;{:params (get-in request [:params :sql])}


(defn get-store-config [handle]
	(fn[request]
		(when (empty? @storefront/store_setting)
			(dosync (ref-set storefront/store_setting (json/read-str (slurp "config.json"))))
			)
		(handle request)
		)
)

(defroutes app-routes
     	  (GET "/*" request (response/response (io/file (str "resources" (:uri request)))))
		  (POST "/bigcommerce/graphql/query" request (storefront/process-graphql request))
		  (POST "/bigcommerce/front/query" request (storefront/process-front request))
		  (POST "/bigcommerce/server/query" request (storefront/process-server request))
		  (POST "/bigcommerce/server/payment" request (storefront/process-payment request))
      (POST "/bigcommerce/common/query" request (storefront/process-common request))
      (POST "/bigcommerce/customer/orders/:order_id" request (storefront/get-order-by-id request))


	      (route/not-found "Not Found")
           )

(def app
  (-> app-routes
	  get-store-config
      (wrap-defaults (-> site-defaults
                         (assoc-in [:params :multipart] true)
                         (assoc-in [:security :anti-forgery] false))))
  )
