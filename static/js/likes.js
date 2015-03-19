	$(function () {
		setContainerSize();
		$(window).resize(function() {
			setContainerSize();
		});
		
		$(window).scroll(function() {
			if ($('#likesNavItem').hasClass('active')
			    && ! $('#scroll_loading').is(':visible') 
				&& ! $('#noMoreFound').is(':visible') 
				&& ! $('#likesLoading').is(':visible')
				&& ($(window).scrollTop() + $(window).height() > $(document).height() - 400)) {
       	 		
				$('#scroll_loading').show();
				appendLikeItems();
    		}
		});
	});
	
	var feedItemWidth = 236;
	var videoFileTypeId;
	var audioFileTypeId;
	var canEdit = false;
	var fullname;
	var username;
	var profileImageUrl;
	var rootUrl;
	var likeArgs = {
		userId : 0,
		viewingUserId : 0,
		limit : 0,
		beforeId : 0
	};
	var nabarooNetworkTypeId;
	var webNetworkTypeId;	
	
	var isLoggedIn = false;
	
	function getDisplayItemHeight(nativeHeight, nativeWidth) {
		return (nativeHeight * feedItemWidth) / nativeWidth;
	}
		
	function loadLikeFiles(userId, viewingUserId, pageLimit, beforeId, 
					   canEditNabs, vidFileTypeId, audioTypeId, 
					   loggedIn, name, user_name, profile_image_url,
					   nabarooTypeId, webTypeId) {

		setContainerSize();
		$(window).resize(function() {
			setContainerSize();
		});
					   	
		$('#likesLoading').show();
		
		likeArgs.userId = userId;
		likeArgs.viewingUserId = viewingUserId;
		likeArgs.limit = pageLimit;
		likeArgs.beforeId = beforeId;
		
		canEdit = canEditNabs;
		videoFileTypeId = vidFileTypeId;
		audioFileTypeId = audioTypeId;
		rootUrl = window.location.pathname;
		isLoggedIn = loggedIn;
		fullname = name;
		username = user_name;
		profileImageUrl = profile_image_url;
		nabarooNetworkTypeId = nabarooTypeId;
		webNetworkTypeId = webTypeId;
		
		loadLikeItems();
	}
		
	function positionLikeItems() {
		$('#likes').masonry({ 
			itemSelector: '.item' 
		});
	}
		
	function displayLikes() {
		$('#likesLoading').hide();
		$('#scroll_loading').hide();
		
		if ($('#likesNavItem').hasClass('active')) {
			$('#likes').show();
		}
		
		positionLikeItems();
	}
		
	function processLoadedLikeItems() {
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
			likes_viewNab(this);
			return false;
		});
				
		displayLikes();
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
		
	function placeLikeItems(items) {
		$('#likes').remove();
		$('#wrapper').append('<div id="likes" style="display: none;" class="gridContainer"></div>');
		var html = '';	
		
		for (var i in items) {
	 		html += writeLikeItemHTML(items[i], true);
   		}
		
        $('#likes').append(html);
		
		likeArgs.beforeId = items.length > 0 
								? items[items.length - 1].likeId 
								: likeArgs.beforeId;
		
		processLoadedLikeItems();
			
		if ($('#likes .item').length <= 0) {
			$('#likesLoading').hide();
			$('#noLikesFound').show();
		}
	}
	
	function imageLoad(img) {
		$(img).hide();
		$(img).css('opacity', 1);
		$(img).fadeIn(1000);
	}
	
	function likes_nab(btn) {
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
			isMediaSet : item.find('.isMediaSet').val() === 'true',
			playerHTML : item.find('.playerHTML').html(),
			note : item.find('.note').val()
		});
	}
	
	function likes_editNab(btn) {
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
	
	function likes_viewNab(btn) {
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
			isMediaSet : item.find('.isMediaSet').val() === 'true',
			note : item.find('.note').val(),
			playerHTML : item.find('.playerHTML').html(),
			collectionName : item.find('.collectionName').val(),
			collectionOwnerUsername : item.find('.collectionOwnerUsername').val(),
			fullname : item.find('.firstname').val() + ' ' + item.find('.lastname').val(),
			username : item.find('.username').val(),
			profileImageUrl : item.find('.profileImageUrl').val(),
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
				userId : likeArgs.viewingUserId	
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
				userId : likeArgs.viewingUserId	
			},
    		dataType:'json'
		});
		
		item.find('.isLiked').val('true');
		item.find('.likeCount').val(parseInt(item.find('.likeCount').val()) + 1);
		item.find('.likeContainer').hide();
		item.find('.unlikeContainer').show();
	}	
		
	function writeLikeItemHTML(fileItem, positionOnLoad) {
		var height = getDisplayItemHeight(fileItem.displayHeight, fileItem.displayWidth);
		var isHidden = height > 600;
		
		var html = '<div class="item">'
				 + '<a data-toggle="modal" data-target="#viewFile" class="viewFile" href="/n/' + fileItem.alphaId + '">'
				 + '<div class="itemDisplay"' + (isHidden ? ' style="max-height: 450px; overflow: hidden;"' : '') + '>';
		
		if (fileItem.isMediaSet) {
			var urls = fileItem.path.split(' ');
			var isFirstPhoto = true;
			for (var i in urls) {
				html += '<img class="itemImg" onload="imageLoad(this); ' + ((urls.length - 1 === parseInt(i)) ? 'positionFileItems();' : '') + '" style="opacity: 0;' + ( ! isFirstPhoto ? ' margin-top: 5px;' : '') + ' width: ' + feedItemWidth + 'px;" src="' + urls[i] + '"/>';
				isFirstPhoto = false;
			}
		} else {
			html += '<img class="itemImg" onload="imageLoad(this); ' + (positionOnLoad ? 'positionFileItems();' : '') + '" style="opacity: 0; height: ' + height + 'px; width: ' + feedItemWidth + 'px;" src="' + ((fileItem.displayUrl !== null && (typeof fileItem.displayUrl !== 'undefined') && fileItem.displayUrl.length > 0) ? fileItem.displayUrl : '/images/blankVideo.jpg') + '"/>';
		}
							 
		if (fileItem.fileTypeId === videoFileTypeId || fileItem.fileTypeId === audioFileTypeId) {
			html += '<img class="play-button" src="/images/play-video-button.png"/>';
		}
				   
		html += '<div class="feedItemActions">'
			 + '<a class="nabButton" data-toggle="modal" data-target="#nabFile" onclick="likes_nab(this); return false;">'
			 + '<img src="/images/add_ribbon1.png"/></a>';
			 
		if (canEdit && fileItem.userId === likeArgs.viewingUserId) {
		 	html += '<a class="editFile" data-toggle="modal" data-target="#editNab" style="text-decoration: none; cursor: pointer;" onclick="likes_editNab(this); return false;">'
		 		 + '<img src="/images/edit_circle.png"/>'
		         + '</a>';
		} else {
			html += '<div class="likeContainer"' + (fileItem.isLiked ? ' style="display: none;" ' : '') + '><button onclick="like(this); return false;" type="button" class="btn btn-default" style="float: right; position: absolute; border-radius: 60px; top: 8px; left: 8px; width: 48px; height: 48px; padding: 0px; outline: none;">'
				 + '<span class="glyphicon glyphicon-heart" style="font-size: 20px; color: #333;"></span>'
				 + '</button></div>';
					 
			html += '<div class="unlikeContainer"' + ( ! fileItem.isLiked ? ' style="display: none;" ' : '') + '><button onclick="unlike(this); return false;" type="button" class="btn btn-default" style="float: right; position: absolute; border-radius: 60px; top: 8px; left: 8px; width: 48px;height: 48px;padding: 0px;outline: none;">'
			 	 + '<span class="glyphicon glyphicon-heart" style="font-size: 20px; color: #FF5151;"></span>'
				 + '</button></div>';
		}			 
			 
		html += '</div>';
		
		if (isHidden) {
			html += '<h3><span class="label label-default" style="position: absolute; bottom: 0px; z-index: 10; width: 236px; border-radius: 0px;" onclick="viewFullSize(this);">Click to view full size</span></h3>';
		}
		
		var text = (fileItem.name !== null && (typeof fileItem.name !== 'undefined') && fileItem.name.length > 0) ? fileItem.name : '';
		var noMetaData = (text === '' && fileItem.textHTML === '' && ! exists(fileItem.viaAlphaId) && fileItem.networkTypeId !== webNetworkTypeId);
		
		html += '</div></a>'
			 + (noMetaData ? '' : '<br/><br/>')
	         + ((fileItem.textHTML.length > 0) ? '<div class="itemData">' + fileItem.textHTML + '</div>' : '')
			 + '<div class="itemText">' + text + '</div>'
			 + '<div class="playerHTML">' + (fileItem.playerHTML !== null ? fileItem.playerHTML : '') + '</div>'
	         + '<div class="itemData sub" style="margin-bottom: 0px;' + (noMetaData ? 'display: none;' : '') + '">';



		if (fileItem.networkTypeId === nabarooNetworkTypeId || fileItem.networkTypeId === 5 || fileItem.networkTypeId === 9) {
			// do nothing
		} else if (fileItem.networkTypeId === webNetworkTypeId) {
			if ( ! exists(fileItem.viaAlphaId)) {
				var site = fileItem.networkId.length > 21 ? fileItem.networkId.substring(0, 18) + '...' : fileItem.networkId;
				html += '<a target="_blank" style="color: black;" href="' + fileItem.networkFileId + '">Found on ' + site + '</a>';					
			}	
		} else {
			var searchUrl = '/user?u=' + encodeURIComponent(fileItem.networkUsername) + '&n=' + fileItem.networkTypeId + '&id=' + fileItem.networkId;
			html += '<a class="itemUserLink" href="' + searchUrl + '"><img style="margin-right: 4px; width: 14px;" src="' + fileItem.networkIconUrl + '"/>' + fileItem.networkUsername + '</a>';
		}
		
		if (exists(fileItem.viaAlphaId)) {
			html += '<a class="itemUserLink" href="/n/' + fileItem.viaAlphaId + '"><span class="glyphicon glyphicon-retweet" style="margin-right: 2px;"></span> renabbed from ' + fileItem.viaFullname + '</a>';
		}		
		
		html += '</div>'
			  + '<input type="hidden" class="isExistingFile" value="true"/>'
			  + '<input type="hidden" class="isMediaSet" value="' + fileItem.isMediaSet + '"/>'
			  + '<input type="hidden" class="fileId" value="' + fileItem.fileId + '"/>'
			  + '<input type="hidden" class="fileTypeId" value="' + fileItem.fileTypeId + '"/>'
			  + '<input type="hidden" class="path" value="' + fileItem.path + '"/>'
			  + '<input type="hidden" class="networkTypeId" value="' + fileItem.networkTypeId + '"/>'
			  + '<input type="hidden" class="networkFileId" value="' + (fileItem.networkFileId !== null ? fileItem.networkFileId : '') + '"/>'
			  + '<input type="hidden" class="networkTimestamp" value="' + fileItem.networkTimestamp + '"/>'
			  + '<input type="hidden" class="networkUsername" value="' + fileItem.networkUsername + '"/>'
			  + '<input type="hidden" class="networkId" value="' + fileItem.networkId + '"/>'			
			  + '<input type="hidden" class="networkProfileImageUrl" value="' + fileItem.networkProfileImageUrl + '"/>'
			  + '<input type="hidden" class="displayImageUrl" value="' + fileItem.displayUrl + '"/>'
			  + '<input type="hidden" class="displayImageWidth" value="' + fileItem.displayWidth + '"/>'
			  + '<input type="hidden" class="displayImageHeight" value="' + fileItem.displayHeight + '"/>'
			  + '<input type="hidden" class="collectionId" value="' + fileItem.collectionId + '"/>'	
			  + '<input type="hidden" class="networkIconUrl" value="' + fileItem.networkIconUrl + '"/>'
			  + '<input type="hidden" class="collectionName" value="' + fileItem.collectionName + '"/>'
			  + '<input type="hidden" class="collectionOwnerUsername" value="' + fileItem.collectionOwnerUsername + '"/>'
			  + '<input type="hidden" class="userId" value="' + fileItem.userId + '"/>'
			  + '<input type="hidden" class="firstname" value="' + fileItem.firstname + '"/>'
			  + '<input type="hidden" class="lastname" value="' + fileItem.lastname + '"/>'			  			  
			  + '<input type="hidden" class="username" value="' + fileItem.username + '"/>'
			  + '<input type="hidden" class="profileImageUrl" value="' + fileItem.profileImageUrl + '"/>'
			  + '<input type="hidden" class="isLiked" value="' + fileItem.isLiked + '"/>'
			  + '<input type="hidden" class="likeCount" value="' + fileItem.likeCount + '"/>'
			  + '<input type="hidden" class="renabCount" value="' + fileItem.renabCount + '"/>'
			  + '<input type="hidden" class="timestamp" value="' + fileItem.addedTimestamp + '"/>'
			  + '<input type="hidden" class="tags" value="' + (exists(fileItem.tags) ? fileItem.tags : '') + '"/>'
			  + '<input type="hidden" class="actualFileId" value="' + fileItem.actualFileId + '"/>'
			  + '<input type="hidden" class="note" value="' + fileItem.note + '"/>'
			  + '<input type="hidden" class="viaAlphaId" value="' + (exists(fileItem.viaAlphaId) ? fileItem.viaAlphaId : '') + '"/>'
			  + '<input type="hidden" class="viaFullname" value="' + (exists(fileItem.viaFullname) ? fileItem.viaFullname : '') + '"/>';
		
		html += '<hr style="margin-bottom: 0px; margin-top: 0px;"/>'
			 + '<a href="/' + fileItem.collectionOwnerUsername + '/' + getUrlSafeCollectionName(fileItem.collectionName) + '">'
		     + '<div class="nabCollectionInfoWrapper"><div class="nabCollectionInfo">'
			 + '<img src="' + fileItem.profileImageUrl + '" class="nabCollectionCover" />'
			 + '<span style="font-size: 12px; color: #333;"><b>' + fileItem.firstname + ' ' + fileItem.lastname + '</b> nabbed to <b>' + fileItem.collectionName + '</b>'
				 
			 if (exists(fileItem.note) && fileItem.note !== '') {
			 	html += ' and noted <b>"' + fileItem.note + '"</b>';
		 	 }
				 
		html += '</span>'			 
			 + '</div></div></a></div>';

			  
		return html;
	}
	
	function loadLikeItems() {
		$.ajax({
    		url: canEdit ? '/ajax/file/getLikedItems.php' : '/ajax/file/getLikedPublicItems.php',
    		type: 'POST',
    		data: likeArgs,
    		dataType:'json',
    		success: function(items) {
				placeLikeItems(items);		
			},
			error: function(a, b, c) {
				displayLikes();
			}
		});
	}
	
	function appendLikeItems() {
		$.ajax({
    		url: canEdit ? '/ajax/file/getLikedItems.php' : '/ajax/file/getLikedPublicItems.php',
    		type: 'POST',
    		data: likeArgs,
    		dataType:'json',
    		success: function(items) {
				if (items.length <= 0 && ($('#likes .item').length > 0)) {
					displayLikes();
					$('#noMoreFound').show();
				} else {
					likeArgs.beforeId = items.length > 0 
											? items[items.length - 1].likeId 
											: likeArgs.beforeId;
					
					var html = '';
					for (var i in items) {
						html += writeLikeItemHTML(items[i], false);
					}
					
        			var $moreFiles = jQuery(html);
        			$('#likes').append($moreFiles);
					processLoadedLikeItems();
        			$('#likes').masonry('appended', $moreFiles);  
				}
			},
			error: function(a, b, c) {
				displayLikes();
			}
		});
	}
	
	function removeFile(fileId) {
		var item = $('.actualFileId[value="' + fileId + '"]').parent();
		$('#files').masonry('remove', item);
		$('#likes').masonry('remove', item);
		positionLikeItems();
		positionFileItems();
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