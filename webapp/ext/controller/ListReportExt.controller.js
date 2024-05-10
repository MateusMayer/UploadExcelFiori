sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    'use strict';

    return {
        uploadExcel: function(oEvent) {
            //MessageToast.show("Cliquei no botão rapaziada");
            if (!this.importDialog) {
                //create instance of fragment
                this.importDialog = sap.ui.xmlfragment("zevent6.ext.fragment.fileUpload", this);
            }
            this.getView().addDependent(this.importDialog);
            this.importDialog.open();
        },
        handleCancelPress: function (oEvent) {
            this.importDialog.close();
            this.importDialog.destroy();
            this.importDialog = null;
        },
         
        handleUploadComplete: function (oEvent) {
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            var sMsg = "";
            var sMsgType = "Error";
            var oResponse = oEvent.getParameters("response");
            if (oResponse) {
                if (oResponse.status === 201) {
                    //TODO use i18n
                    //sMsg = "Upload Success";
                    sMsg = this._parseResponse(oResponse.headers["sap-message"], 9);
                    sMsgType = "Information";
                } else {
                    sMsg = this._parseResponse(oResponse.responseRaw, 23);
                }
            }
            this.extensionAPI.refreshTable(
                "zevent6::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_Event--listReport");
            this.importDialog.destroy();
            this.importDialog = null;
            sap.m.MessageToast.show("File Uploaded");
        },
        handleUploadPress: function (oEvent) {
            //perform upload
            //var vService = "/sap/opu/odata/sap/ZEVENT_SRV/ZC_Event";
            var vService = "/sap/opu/odata/sap/ZAM_UPLOADEXCEL_SRV/";
            //var oModel = this.getView().getModel();
            var oModel = new sap.ui.model.odata.ODataModel(vService,true); 
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            var oFileUploader = sap.ui.getCore().byId("fupImport");
            var sMsg = "";
     
            //check file has been entered
            var sFile = oFileUploader.getValue();
            if (!sFile) {
                sMsg = "Please select a file first";
                sap.m.MessageToast.show(sMsg);
                return;
            }
            else{
                var that = this;
                that._addTokenToUploader();
                oFileUploader.upload();
                that.importDialog.close();
                         
            }
     
        },
     
        _addTokenToUploader: function () {
            //Add header parameters to file uploader.
            var vService = "/sap/opu/odata/sap/ZAM_UPLOADEXCEL_SRV/";
            //var oDataModel = this.getView().getModel();
            var oDataModel = new sap.ui.model.odata.ODataModel(vService,true); 
            var sTokenForUpload = oDataModel.getSecurityToken();
            var oFileUploader = sap.ui.getCore().byId("fupImport");
            var oHeaderParameter = new sap.ui.unified.FileUploaderParameter({
                name: "X-CSRF-Token",
                value: sTokenForUpload
            });
     
            var sFile = oFileUploader.getValue();
            var oHeaderSlug = new sap.ui.unified.FileUploaderParameter({
                name: "SLUG",
                value: sFile
            });
     
            //Header parameter need to be removed then added.
            oFileUploader.removeAllHeaderParameters();
            oFileUploader.addHeaderParameter(oHeaderParameter);
     
            oFileUploader.addHeaderParameter(oHeaderSlug);
            //set upload url
            //var sUrl = oDataModel.sServiceUrl + "/FileUploadSet";
            var sUrl = oDataModel.sServiceUrl + "/FileDataSet";
            oFileUploader.setUploadUrl(sUrl);
        },
     
        _parseResponse: function (sResponse, iOffset) {
            var sTempStr, iIndexS, iIndexE;
            //var oParseResults = {};
            var sMessage;
            iIndexS = sResponse.indexOf("<message");
            iIndexE = sResponse.indexOf("</message>");
            if (iIndexS !== -1 && iIndexE !== -1) {
                sTempStr = sResponse.slice(iIndexS + iOffset, iIndexE);
                sMessage = sTempStr;
            }
            return sMessage;
     
        }
    };
});