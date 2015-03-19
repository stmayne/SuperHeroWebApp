	$(function () {
		setContainerSize();
		$(window).resize(function() {
			setContainerSize();
		});
		
		$(window).scroll(function() {
    		if ( ! $('#collection_scroll_loading').is(':visible') 
				&& ! $('#noMoreFound').is(':visible') 
				&& ($(window).scrollTop() + $(window).height() > $(document).height() - 400)) {
       	 		
				$('#collection_scroll_loading').show();
				appendCollectionItems();
    		}
		});
		
		History.Adapter.bind(window, 'statechange', function() {
		    var state = History.getState();
				
			if (state.data.viewArgs !== null && (typeof state.data.viewArgs !== 'undefined')) {
				viewFile(state.data.viewArgs);
				$('#viewFile').modal('show');	
			} else {
				$('#viewFile').modal('hide');
			}
		});	
			
	});
	
	var feedItemWidth = 236;
	var videoFileTypeId;
	var audioFileTypeId;
	var collectionArgs = {};
	var rootUrl;
	var canEdit = false;
	var collectionName = '';
	var ownerUsername = '';
	var coverImageUrl = '';
	var isLoggedIn = false;
	var nabarooNetworkTypeId;
	var webNetworkTypeId;
	
	function getDisplayItemHeight(nativeHeight, nativeWidth) {
		return (nativeHeight * feedItemWidth) / nativeWidth;
	}
		
	function loadCollection(collectionId, pageLimit, beforeId, 
							vidFileTypeId, audioTypeId, canEditCollection, viewingUserId, 
							name, username, collectionCoverImageUrl, loggedIn,
							nabarooTypeId, webTypeId) {
								
		$('#collection_loading').show();
			
		collectionArgs = {
			collectionId : collectionId,
			viewingUserId : viewingUserId,
			limit : pageLimit,
			beforeId : beforeId
		};
		
		canEdit = canEditCollection;
		videoFileTypeId = vidFileTypeId;
		audioFileTypeId = audioTypeId;
		rootUrl = window.location.pathname;
		isLoggedIn = loggedIn;
		collectionName = name;
		ownerUsername = username;
		coverImageUrl = collectionCoverImageUrl;
		nabarooNetworkTypeId = nabarooTypeId;
		webNetworkTypeId = webTypeId;
		
		loadCollectionItems();
		
		$('#viewFile').on('hide.bs.modal', function (e) {
			History.pushState(null, null, rootUrl);
  			hideNab();
		});		
	}
		
	function positionCollectionItems() {
		$('#collection').masonry({ 
			itemSelector: '.item' 
		});
	}
		
	function displayCollection() {
		$('#collection_loading').hide();
		$('#collection_scroll_loading').hide();
		$('#collection').show();
	}
		
	function processLoadedItems() {
			// bind item actions
			$('.itemDisplay').hover(function() {
				$(this).find('.feedItemActions').show();
				$(this).css('opacity', 0.9);
			});
		
			$('.itemDisplay').mouseleave(function() {
				$(this).find('.feedItemActions').hide();
				$(this).css('opacity', 1);
			});
				
			$('.itemDisplay').each(function() {
				var itemDisplay = $(this);
					
				itemDisplay.find('.nabButton').first().hover(function () {
					itemDisplay.css('opacity', 1);
				});	
					
				itemDisplay.find('.nabButton').first().mouseleave(function () {
					itemDisplay.css('opacity', 0.9);
				});	
			});
				
			// position play button in center of image
			var playButtonHeight = 91;
			var marginTop;
				
			$('.play-button').each(function() {
				marginTop = ($(this).parent().find('.itemImg').first().height() - playButtonHeight)/2;
				$(this).css('margin-top', marginTop + 'px');
			});
			
			$('.viewFile').click(function () {
				viewNab(this);
				return false;
			});
				
			displayCollection();
	} 
		
	function getFeedItemDate(timestamp) {
		var dateString = '';

		var currentTimestamp = (new Date().getTime()/1000);
		var secondsFromNow = Math.floor(currentTimestamp - timestamp);
		var minsFromNow = Math.floor(secondsFromNow/60);
		var hoursFromNow = Math.floor(minsFromNow/60);
		var daysFromNow = Math.floor(hoursFromNow/24);
		var weeksFromNow = Math.floor(daysFromNow/7);
		var monthsFromNow = Math.floor(weeksFromNow/4);
		var yearsFromNow = Math.floor(monthsFromNow/12);
		
		if (secondsFromNow < 60) {
			dateString = (secondsFromNow === 1) ? ('1 second ago') : (secondsFromNow + ' seconds ago');
		} else if (minsFromNow < 60) {
			dateString = (minsFromNow === 1) ? ('1 minute ago') : (minsFromNow + ' minutes ago');
		} else if (hoursFromNow < 24) {
			dateString = (hoursFromNow === 1) ? ('1 hour ago') : (hoursFromNow + ' hours ago');
		} else if (daysFromNow < 7) {
			dateString = (daysFromNow === 1) ? ('yesterday') : (daysFromNow + ' days ago');
		} else if (weeksFromNow < 4) {
			dateString = (weeksFromNow === 1) ? ('1 week ago') : (weeksFromNow + ' weeks ago');
		} else if (monthsFromNow < 12) {
			dateString = (monthsFromNow === 1) ? ('1 month ago') : (monthsFromNow + ' months ago');
		} else {
			dateString = (yearsFromNow === 1) ? ('about a year ago') : (yearsFromNow + ' years ago');
		} 
			
		return dateString;
	}
		
	function placeCollectionItems(items) {
		var html = '';	
		for (var i in items) {
	 		html += writeCollectionItemHTML(items[i], true);
   		}
		
        $('#collection').append(html);
		
		collectionArgs.beforeId = items.length > 0 
								? items[items.length - 1].actualFileId 
								: collectionArgs.beforeId;
		
		processLoadedItems();
			
		if ($('.item').length <= 0) {
			$('#collection_loading').hide();
			$('#noDataFoundMessage').show();
		}
	}
	
	function imageLoad(img) {
		$(img).hide();
		$(img).css('opacity', 1);
		$(img).fadeIn(1000);
	}
	
	function nab(btn) {
		if ( ! isLoggedIn) {
			window.location.href = '/login?cont=' + window.location.pathname;
			return;
		}
		
		var item = $(btn).parent().parent().parent();
		
		nabFile({
			existingFile : item.find('.isExistingFile').val() === 'true',
			fileId : parseInt(item.find('.fileId').val()),
			fileTypeId : parseInt(item.find('.fileTypeId').val()),
			text : item.find('.itemText').html(),
			path : item.find('.path').val(),
			networkTypeId : parseInt(item.find('.networkTypeId').val()),
			networkFileId : item.find('.networkFileId').val(),
			networkTimestamp : item.find('.networkTimestamp').val(),
			networkUsername : item.find('.networkUsername').val(),
			networkId : item.find('.networkId').val(),
			networkProfileImageUrl : item.find('.networkProfileImageUrl').val(),
			displayUrl : item.find('.displayImageUrl').val(),
			displayWidth : parseInt(item.find('.displayImageWidth').val()),
			displayHeight : parseInt(item.find('.displayImageHeight').val()),
			playerHTML : item.find('.playerHTML').html(),
			isMediaSet : item.find('.isMediaSet').val() === 'true',
			note : item.find('.note').val()
		});
	}
	
	function editNab(btn) {
		var item = $(btn).parent().parent().parent();
		
		editFile({
			collectionId : parseInt(item.find('.collectionId').val()),
			fileId : parseInt(item.find('.actualFileId').val()),
			networkTypeId : parseInt(item.find('.networkTypeId').val()),
			networkFileId : item.find('.networkFileId').val(),
			displayUrl : item.find('.displayImageUrl').val(),
			note : item.find('.note').val(),
			name : item.find('.itemText').html(),
			tags : item.find('.tags').val()
		});		
	}	
	
		
	function viewNab(btn) {
		var item = $(btn).parent().parent();
		
		var args = {
			existingFile : item.find('.isExistingFile').val() === 'true',
			fileId : parseInt(item.find('.fileId').val()),
			fileTypeId : parseInt(item.find('.fileTypeId').val()),
			text : item.find('.itemText').html(),
			path : item.find('.path').val(),
			networkTypeId : parseInt(item.find('.networkTypeId').val()),
			networkFileId : item.find('.networkFileId').val(),
			networkTimestamp : item.find('.networkTimestamp').val(),
			networkUsername : item.find('.networkUsername').val(),
			networkId : item.find('.networkId').val(),
			networkProfileImageUrl : item.find('.networkProfileImageUrl').val(),
			displayUrl : item.find('.displayImageUrl').val(),
			displayWidth : parseInt(item.find('.displayImageWidth').val()),
			displayHeight : parseInt(item.find('.displayImageHeight').val()),
			networkIconUrl : item.find('.networkIconUrl').val(),
			textHTML : (item.find('.itemText').html().length > 0 || item.find('.tags').val().length > 0) ? item.find('.itemData').html() : '',
			playerHTML : item.find('.playerHTML').html(),
			isMediaSet : item.find('.isMediaSet').val() === 'true',
			note : item.find('.note').val(),
			fullname : item.find('.fullname').val(),
	        username : item.find('.username').val(),
			profileImageUrl : item.find('.profileImageUrl').val(),
			collectionName : collectionName,
			collectionOwnerUsername : ownerUsername,
			isLiked : item.find('.isLiked').val() === 'true',
			timestamp : item.find('.timestamp').val(),
			likeCount : parseInt(item.find('.likeCount').val()),
			renabCount : parseInt(item.find('.renabCount').val()),
			viaAlphaId : item.find('.viaAlphaId').val(),
			viaFullname : item.find('.viaFullname').val()
		};
		
		History.pushState({viewArgs : args}, '', $(btn).prop('href'));
	}		

	function unlike(btn) {
		var item = $(btn).parent().parent().parent().parent();
		
		$.ajax({
    		url: '/ajax/file/unlike.php',
    		type: 'POST',
    		data: {
				fileId : parseInt(item.find('.fileId').val()),
				userId : collectionArgs.viewingUserId	
			},
    		dataType:'json'
		});
		
		item.find('.isLiked').val('false');
		item.find('.likeCount').val(parseInt(item.find('.likeCount').val()) - 1);
		item.find('.unlikeContainer').hide();
		item.find('.likeContainer').show();
	}

	function like(btn) {
		if ( ! isLoggedIn) {
			window.location.href = '/login?cont=' + window.location.pathname;
			return;
		}		

		var item = $(btn).parent().parent().parent().parent();
		
		$.ajax({
    		url: '/ajax/file/like.php',
    		type: 'POST',
    		data: {
				fileId : parseInt(item.find('.fileId').val()),
				userId : collectionArgs.viewingUserId	
			},
    		dataType:'json'
		});
		
		item.find('.isLiked').val('true');
		item.find('.likeCount').val(parseInt(item.find('.likeCount').val()) + 1);
		item.find('.likeContainer').hide();
		item.find('.unlikeContainer').show();
	}
		
	function writeCollectionItemHTML(collectionItem, positionOnLoad) {
		var height = getDisplayItemHeight(collectionItem.displayHeight, collectionItem.displayWidth);
		var isHidden = height > 600;
		
		var html = '<div class="item">'
				 + '<a data-toggle="modal" data-target="#viewFile" class="viewFile" href="/n/' + collectionItem.alphaId + '">'
				 + '<div class="itemDisplay"' + (isHidden ? ' style="max-height: 450px; overflow: hidden;"' : '') + '>';
				 
		if (collectionItem.isMediaSet) {
			var urls = collectionItem.path.split(' ');
			var isFirstPhoto = true;
			for (var i in urls) {
				html += '<img class="itemImg" onload="imageLoad(this); ' + ((urls.length - 1 === parseInt(i)) ? 'positionCollectionItems();' : '') + '" style="opacity: 0;' + ( ! isFirstPhoto ? ' margin-top: 5px;' : '') + ' width: ' + feedItemWidth + 'px;" src="' + urls[i] + '"/>';
				isFirstPhoto = false;
			}
		} else {
			html += '<img class="itemImg" onload="imageLoad(this);' + (positionOnLoad ? 'positionCollectionItems();' : '') + '" style="opacity: 0; height: ' + height + 'px; width: ' + feedItemWidth + 'px;" src="' + ((collectionItem.displayUrl !== null && (typeof collectionItem.displayUrl !== 'undefined') && collectionItem.displayUrl.length > 0) ? collectionItem.displayUrl : '/images/blankVideo.jpg') + '"/>';
		}
							 
		if (collectionItem.fileTypeId === videoFileTypeId) {
			html += '<img class="play-button" src="/images/play-video-button.png"/>';
		}
						
		html += '<div class="feedItemActions">'
			 + '<a class="nabButton" data-toggle="modal" data-target="#nabFile" onclick="nab(this); return false;">'
			 + '<img src="/images/add_ribbon1.png"/></a>';
			 
			 if (canEdit) {
			 	html += '<a class="editFile" data-toggle="modal" data-target="#editNab" style="text-decoration: none; cursor: pointer;" onclick="editNab(this); return false;">'
			 		 + '<img src="/images/edit_circle.png"/>'
			         + '</a>';
			 } else {
			 	html += '<div class="likeContainer"' + (collectionItem.isLiked ? ' style="display: none;" ' : '') + '><button onclick="like(this); return false;" type="button" class="btn btn-default" style="float: right; position: absolute; border-radius: 60px; top: 8px; left: 8px; width: 48px; height: 48px; padding: 0px; outline: none;">'
				 	 + '<span class="glyphicon glyphicon-heart" style="font-size: 20px; color: #333;"></span>'
					 + '</button></div>';
					 
				html += '<div class="unlikeContainer"' + ( ! collectionItem.isLiked ? ' style="display: none;" ' : '') + '><button onclick="unlike(this); return false;" type="button" class="btn btn-default" style="float: right; position: absolute; border-radius: 60px; top: 8px; left: 8px; width: 48px;height: 48px;padding: 0px;outline: none;">'
				 	 + '<span class="glyphicon glyphicon-heart" style="font-size: 20px; color: #FF5151;"></span>'
					 + '</button></div>';
			 }

	    html += '</div>';
			 
		if (isHidden) {
			html += '<h3><span class="label label-default" style="position: absolute; bottom: 0px; z-index: 10; width: 236px; border-radius: 0px;" onclick="viewFullSize(this);">Click to view full size</span></h3>';
		}
			 
		var text = (collectionItem.name !== null && (typeof collectionItem.name !== 'undefined') && collectionItem.name.length > 0) ? collectionItem.name : '';
		var noMetaData = (text === '' && collectionItem.textHTML === '' && ! exists(collectionItem.viaAlphaId) && collectionItem.networkTypeId !== webNetworkTypeId);
		
		html += '</div></a>'
			 + (noMetaData ? '' : '<br/><br/>')
	         + ((collectionItem.textHTML.length > 0) ? '<div class="itemData">' + collectionItem.textHTML + '</div>' : '')
			 + '<div class="playerHTML">' + (collectionItem.playerHTML !== null ? collectionItem.playerHTML : '') + '</div>'			 
			 + '<div class="itemText">' + text + '</div>'
	         + '<div class="itemData sub" style="margin-bottom: 0px;' + (noMetaData ? 'display: none;' : '') + '">';			


		if (collectionItem.networkTypeId === nabarooNetworkTypeId || collectionItem.networkTypeId === 5 || collectionItem.networkTypeId === 9) {
			// do nothing
		} else if (collectionItem.networkTypeId === webNetworkTypeId) {
			if ( ! exists(collectionItem.viaAlphaId)) {
				var site = collectionItem.networkId.length > 21 ? collectionItem.networkId.substring(0, 18) + '...' : collectionItem.networkId;
				html += '<a target="_blank" style="color: black;" href="' + collectionItem.networkFileId + '">Found on ' + site + '</a>';					
			}
		} else {		
			var searchUrl = '/user?u=' + encodeURIComponent(collectionItem.networkUsername) + '&n=' + collectionItem.networkTypeId + '&id=' + collectionItem.networkId;
			html += '<a class="itemUserLink" href="' + searchUrl + '"><img style="margin-right: 4px; width: 14px;" src="' + collectionItem.networkIconUrl + '"/>' + collectionItem.networkUsername + '</a>';		
		}
		
		if (exists(collectionItem.viaAlphaId)) {
			html += '<a class="itemUserLink" href="/n/' + collectionItem.viaAlphaId + '"><span class="glyphicon glyphicon-retweet" style="margin-right: 2px;"></span> renabbed from ' + collectionItem.viaFullname + '</a>';		
		}
		
		/*
		if (collectionItem.renabCount > 0 || collectionItem.likeCount > 0 || collectionItem.commentCount > 0) {
			if (collectionItem.networkTypeId === webNetworkTypeId || exists(collectionItem.viaAlphaId)) {
				html += '<br/><br/>';
			}
			
			if (collectionItem.renabCount > 0) {
				html += '<span style="float: left; font-weight: normal; color: #aaa;"><span class="glyphicon glyphicon-bookmark" style="margin-right: 2px;"></span>' + collectionItem.renabCount + '</span>';
			}
			
			if (collectionItem.likeCount > 0) {
				html += '<span style="float: left; font-weight: normal;' + (collectionItem.renabCount > 0 ? 'margin-left: 5px;' : '') + 'color: #aaa;"><span class="glyphicon glyphicon-heart" style="margin-right: 2px;"></span>' + collectionItem.likeCount + '</span>';
			}
			
			if (collectionItem.commentCount > 0) {
				html += '<span style="float: left; font-weight: normal;' + ((collectionItem.renabCount > 0 || collectionItem.likeCount > 0) ? 'margin-left: 5px;' : '') + 'color: #aaa;"><span class="glyphicon glyphicon-comment" style="margin-right: 2px;"></span>' + collectionItem.commentCount + '</span>';
			}
			
			html += '<br/>';
		}
		*/
		
		html += '</div>'
			  + '<input type="hidden" class="isExistingFile" value="true"/>'
			  + '<input type="hidden" class="isMediaSet" value="' + collectionItem.isMediaSet + '"/>'
			  + '<input type="hidden" class="fileId" value="' + collectionItem.fileId + '"/>'
			  + '<input type="hidden" class="fileTypeId" value="' + collectionItem.fileTypeId + '"/>'
			  + '<input type="hidden" class="path" value="' + collectionItem.path + '"/>'
			  + '<input type="hidden" class="networkTypeId" value="' + collectionItem.networkTypeId + '"/>'
			  + '<input type="hidden" class="networkFileId" value="' + (collectionItem.networkFileId !== null ? collectionItem.networkFileId : '') + '"/>'
			  + '<input type="hidden" class="networkTimestamp" value="' + collectionItem.networkTimestamp + '"/>'
			  + '<input type="hidden" class="networkUsername" value="' + collectionItem.networkUsername + '"/>'
			  + '<input type="hidden" class="networkId" value="' + collectionItem.networkId + '"/>'			
			  + '<input type="hidden" class="networkProfileImageUrl" value="' + collectionItem.networkProfileImageUrl + '"/>'
			  + '<input type="hidden" class="displayImageUrl" value="' + collectionItem.displayUrl + '"/>'
			  + '<input type="hidden" class="displayImageWidth" value="' + collectionItem.displayWidth + '"/>'
			  + '<input type="hidden" class="displayImageHeight" value="' + collectionItem.displayHeight + '"/>'
			  + '<input type="hidden" class="collectionId" value="' + collectionArgs.collectionId + '"/>'
			  + '<input type="hidden" class="networkIconUrl" value="' + collectionItem.networkIconUrl + '"/>'
			  + '<input type="hidden" class="fullname" value="' + collectionItem.addingUserFirstname + ' ' + collectionItem.addingUserLastname + '"/>'
			  + '<input type="hidden" class="username" value="' + collectionItem.addingUsername + '"/>'
			  + '<input type="hidden" class="profileImageUrl" value="' + collectionItem.addingUserProfileImageUrl + '"/>'	
			  + '<input type="hidden" class="isLiked" value="' + collectionItem.isLiked + '"/>'
			  + '<input type="hidden" class="timestamp" value="' + collectionItem.addedTimestamp + '"/>'
			  + '<input type="hidden" class="likeCount" value="' + collectionItem.likeCount + '"/>'
			  + '<input type="hidden" class="renabCount" value="' + collectionItem.renabCount + '"/>'
			  + '<input type="hidden" class="tags" value="' + (exists(collectionItem.tags) ? collectionItem.tags : '') + '"/>'
			  + '<input type="hidden" class="note" value="' + collectionItem.note + '"/>'
			  + '<input type="hidden" class="actualFileId" value="' + collectionItem.actualFileId + '"/>'
			  + '<input type="hidden" class="viaAlphaId" value="' + (exists(collectionItem.viaAlphaId) ? collectionItem.viaAlphaId : '') + '"/>'
			  + '<input type="hidden" class="viaFullname" value="' + (exists(collectionItem.viaFullname) ? collectionItem.viaFullname : '') + '"/>';
			  
		html += '<hr style="margin-bottom: 0px; margin-top: 0px;"/>'
			 + '<a href="/' + ownerUsername + '/' + getUrlSafeCollectionName(collectionName) + '">'
		     + '<div class="nabCollectionInfoWrapper"><div class="nabCollectionInfo">'
		     + '<img src="' + collectionItem.addingUserProfileImageUrl + '" class="nabCollectionCover" />'
			 + '<span style="font-size: 12px; color: #333;"><b>' + collectionItem.addingUserFirstname + ' ' + collectionItem.addingUserLastname + '</b> nabbed to <b>' + collectionName + '</b>'
				 
			 if (exists(collectionItem.note) && collectionItem.note !== '') {
			 	html += ' and noted <b>"' + collectionItem.note + '"</b>';
			 }
				 
		html += '</span>'			 
			 + '</div></div></a></div>';
			 
			  
		return html;
	}
		
	function loadCollectionItems() {
		$.ajax({
    		url: '/ajax/collection/getCollectionItems.php',
    		type: 'POST',
    		data: collectionArgs,
    		dataType:'json',
    		success: function(items) {
				placeCollectionItems(items);			
			},
			error: function(a, b, c) {
				displayCollection();
			}
		});
	}
	
	function appendCollectionItems() {
		$.ajax({
    		url: '/ajax/collection/getCollectionItems.php',
    		type: 'POST',
    		data: collectionArgs,
    		dataType:'json',
    		success: function(items) {
				if (items.length <= 0 && ($('.item').length > 0)) {
					displayCollection();
					$('#noMoreFound').show();
				} else {
					collectionArgs.beforeId = items.length > 0 
											? items[items.length - 1].actualFileId 
											: collectionArgs.beforeId;
					
					var html = '';
					for (var i in items) {
						html += writeCollectionItemHTML(items[i], false);
					}
					
        			var $moreFiles = jQuery(html);
        			$('#collection').append($moreFiles);
					processLoadedItems();
        			$('#collection').masonry('appended', $moreFiles);  
				}
			},
			error: function(a, b, c) {
				displayCollection();
			}
		});
	}
	
	function removeFile(fileId) {
		var item = $('.actualFileId[value="' + fileId + '"]').parent();
		$('#collection').masonry('remove', item);
		positionCollectionItems();
	}
	
	function likeFile(fileId) {
		var item = $('.fileId[value="' + fileId + '"]').parent();
		item.find('.isLiked').val('true');
		item.find('.likeCount').val(parseInt(item.find('.likeCount').val()) + 1);
		item.find('.unlikeContainer').show();
		item.find('.likeContainer').hide();
	}
	
	function unlikeFile(fileId) {
		var item = $('.fileId[value="' + fileId + '"]').parent();
		item.find('.isLiked').val('false');
		item.find('.likeCount').val(parseInt(item.find('.likeCount').val()) - 1);
		item.find('.unlikeContainer').hide();
		item.find('.likeContainer').show();
	}