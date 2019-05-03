/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

var viewerApp, jsonName, URN;
function launchViewer(urn,name) {
    URN = urn;
    jsonName = name;
    var options = {
        env: 'AutodeskProduction',
        getAccessToken: getForgeToken
    };
    var documentId = 'urn:' + urn;
    Autodesk.Viewing.Initializer(options, function onInitialized() {
        viewerApp = new Autodesk.Viewing.ViewingApplication('forgeViewer');
        viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D);
        viewerApp.loadDocument(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
    });
}

function onDocumentLoadSuccess(doc) {
    // We could still make use of Document.getSubItemsWithProperties()
    // However, when using a ViewingApplication, we have access to the **bubble** attribute,
    // which references the root node of a graph that wraps each object from the Manifest JSON.
    var viewables = viewerApp.bubble.search({ 'type': 'geometry', 'role':'3d'  });
    if (viewables.length === 0) {
        console.error('Document contains no viewables.');
        return;
    }
    // Choose any of the avialble viewables
    viewerApp.selectItem(viewables[0].data, onItemLoadSuccess, onItemLoadFail);
}

function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

var data = [{"objectid":3712,"name":"Highlight Concrete Walls"},{"objectid":3641,"name":"Highlight Concrete Slabs"}]
var walls = [3653, 3654, 3656, 3657, 3660, 3662, 3664, 3666, 3668, 3670, 3672, 3674, 3676, 3678, 3680, 3682, 3684, 3686, 3688, 3690, 3692, 3694, 3696, 3698, 3700, 3702, 3704, 3706, 3709, 3710, 3712, 3714, 3716, 3727, 3733, 3735, 3737, 3739, 3741, 3743, 3745, 3748, 3750, 3756, 3758, 3761, 3763, 3786, 3788, 3790, 3792, 7676, 7678, 7867, 7901, 7935, 8061, 8178]

function onItemLoadSuccess(viewer, item) {
    // item loaded, any custom action?
 /*
    START - CIRCUIT
    */

   $('.highlight_walls').click(function(){
        // let objs = await searchDbIds('Category',['Revit Floors'])
        // console.log(objs)
        viewer.select(walls)
       viewer.fitToView(walls, viewer.model)// Area: 451.1388559999983  vol: 112.78471399999957
       setParameters(viewer,walls)
   })

   $('.highlight_slabs').click(function(){
       viewer.select(7197)
       viewer.fitToView(7197, viewer.model)// Area: 451.1388559999983  vol: 112.78471399999957
       $('.total_volume').text(112.78471399999957)
       $('.total_area').text(451.1388559999983)
   })
var shown = false;
var formworks,formworks1;
var overlayName = "temperary-colored-overlay";
var overlayName1 = "temperary-colored-overlay1";
   $('.peri_equipment').click(function(){
       if (!shown) {
           viewer.model.search('yes',searchCallback,errorCallback,['Mark'])
           viewer.model.search('no',searchCallback1,errorCallback,['Mark'])
           shown = true;           
       } else {
        restoreColorMaterial(viewer,formworks,overlayName);
        restoreColorMaterial(viewer,formworks1,overlayName1);
        shown = false;
       }
    })
    var searchCallback = function(objids){
        formworks = objids;
        setColorMaterial(viewer, objids, 0xff0000,overlayName)
    }
    var searchCallback1 = function(objids){
        formworks1 = objids;
        setColorMaterial(viewer, objids, 0x00ff00,overlayName1)
    }
    /*
    END - CIRCUIT
    */    
}
function setParameters(viewer,dbIds){
    viewer.model.getBulkProperties(dbIds, ['Area','Volume'],
    function(elements){
      var totalarea = 0;
      var totalvolume = 0;
      for(var i=0; i<elements.length; i++){
        totalarea += parseFloat(elements[i].properties[0].displayValue);
        totalvolume += parseFloat(elements[i].properties[1].displayValue);
      }
      $('.total_volume').text(totalvolume);
      $('.total_area').text(totalarea);
    })
 }
var errorCallback = function(error){
    console.log('error:')
    console.log(error)
}

async function searchDbIds(attributename,value){
    return  viewer.model.search(attributename,value)
}
function addMaterial(viewer,color,overlayname) {
    var material = new THREE.MeshPhongMaterial({
        color: color
    });
    //viewer.impl.matman().addMaterial(newGuid(), material);
    viewer.impl.createOverlayScene(overlayname, material, material);
    return material;
}

function setColorMaterial(viewer, objectIds, color,overlayname) {
    var material = addMaterial(viewer,color,overlayname);

    for (var i=0; i<objectIds.length; i++) {

        var dbid = objectIds[i];

        //from dbid to node, to fragid
        var it = viewer.model.getData().instanceTree;

        it.enumNodeFragments(dbid, function (fragId) {

            
            var renderProxy = viewer.impl.getRenderProxy(viewer.model, fragId);
            
            renderProxy.meshProxy = new THREE.Mesh(renderProxy.geometry, renderProxy.material);

            renderProxy.meshProxy.matrix.copy(renderProxy.matrixWorld);
            renderProxy.meshProxy.matrixWorldNeedsUpdate = true;
            renderProxy.meshProxy.matrixAutoUpdate = false;
            renderProxy.meshProxy.frustumCulled = false;

            viewer.impl.addOverlay(overlayname, renderProxy.meshProxy);
            viewer.impl.invalidate(true);
            
        }, false);
    }

}
function restoreColorMaterial(viewer,objectIds,overlayname) {
       
    for (var i=0; i<objectIds.length; i++) {

        var dbid = objectIds[i];


        //from dbid to node, to fragid
        var it = viewer.model.getData().instanceTree;

        it.enumNodeFragments(dbid, function (fragId) {

            
             var renderProxy = viewer.impl.getRenderProxy(viewer.model, fragId);

            if(renderProxy.meshProxy){

              //remove all overlays with same name
              viewer.impl.clearOverlay(overlayname);
              //viewer.impl.removeOverlay(overlayName, renderProxy.meshProxy);
              delete renderProxy.meshProxy;
              

              //refresh the sence
              
              viewer.impl.invalidate(true);


            }
                                 
        }, true);
    }


}
function onItemLoadFail(errorCode) {
    console.error('onItemLoadFail() - errorCode:' + errorCode);
}

function getForgeToken(callback) {
    jQuery.ajax({
      url: '/api/forge/oauth/token',
      success: function (res) {
        callback(res.access_token, res.expires_in)
      }
    });
  }