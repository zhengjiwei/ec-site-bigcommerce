(ns ecsite.handler
    (:require [compojure.core :refer :all]
      [compojure.route :as route]
      [ring.middleware.defaults :refer [wrap-defaults site-defaults]]
      [clojure.data.json :as json]
      [clojure.data.json :as json]
      [clojure.edn :as edn]
      [ecsite.storefront :as storefront]
      )
    )


;パラメータは以下で取得できます。
;{:params (get-in request [:params :sql])}

(defroutes app-routes
           (GET "/*" request
                 (let [uri (:uri request)]
                 (prn "### uri=" uri)
                      {
                       :status 200
                       :headers {
                            "Access-Control-Allow-Headers" "Origin, X-Requested-With, Content-Type, Accept",
                           "Access-Control-Allow-Origin" "*"
                                 }
                       :body (slurp (str "resources" uri))
                       }
                      )
                 )
		  (POST "/bigcommerce/graphql/query" request (storefront/process-graphql request))
		  (POST "/bigcommerce/front/query" request (storefront/process-front request))
		  (POST "/bigcommerce/server/query" request (storefront/process-server request))
		  (POST "/bigcommerce/server/payment" request (storefront/process-payment request))
		  (POST "/bigcommerce/common/query" request (storefront/process-common request))

           (route/not-found "Not Found"))

(def app
  (-> app-routes
      (wrap-defaults (-> site-defaults
                         (assoc-in [:params :multipart] true)
                         (assoc-in [:security :anti-forgery] false))))
  )
