	var mode = 'users';
	
	$(function () {
		setContainerSize();
		$(window).resize(function() {
			setContainerSize();
		});
		
		$(window).scroll(function() {
			if ( ! $('#feed_scroll_loading').is(':visible') 
				&& ! $('#noMoreFound').is(':visible') 
				&& ! $('#feed_loading').is(':visible')
				&& ($(window).scrollTop() + $(window).height() > $(document).height() - 400)) {
				
				$('#feed_scroll_loading').show();
				
				if (mode === 'users') {
					appendUserInfos();
				} else {
					appendFileItems();
				}
    		}
		});
		
		History.Adapter.bind(window, 'statechange', function() {
		    var state = History.getState();
				
			if (state.data.viewArgs !== null && (typeof state.data.viewArgs !== 'undefined')) {
				viewFile(state.data.viewArgs);
				$('#viewFile').modal('show');
			} else {
				hideNab();
				$('#viewFile').modal('hide');
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
	var nabarooNetworkTypeId;
	var webNetworkTypeId;
	var isLoggedIn = false;
	var nabsPlaced = false;
	
	var searchUserArgs = {
		query : '',
		userId : 0,
		offset : 0,
		limit : 0,
	};	
	
	var searchNabArgs = {
		tagId : 0,
		viewingUserId : 0,
		offset : 0,
		limit : 0,
	};
		
	function loadUsers(query, viewingUserId, offset, limit, loggedIn) {
		mode = 'users';
		setContainerSize();
		$(window).resize(function() {
			setContainerSize();
		});
		
		$('#no_results').hide();
		$('#noMoreFound').hide();
		$('#feed_scroll_loading').hide();
		$('#nabs').hide();		

		$('#feed_loading').show();
		
		isLoggedIn = loggedIn;
		searchUserArgs.query = query;
		searchUserArgs.userId = viewingUserId;
		searchUserArgs.limit = limit;
		searchUserArgs.offset = offset;
		
		loadUserInfos();
	}
		
	function positionUserInfos() {
		$('#users').masonry({ 
			itemSelector: '.followItem' 
		});
	}
		
	function displayUsers() {
		$('#feed_loading').hide();
		$('#feed_scroll_loading').hide();
		
		if (mode === 'users') {
			$('#users').show();
		}
		
		positionUserInfos();
	}
		
	function placeUserInfos(items) {
		$('#users').remove();
		$('#wrapper').prepend('<div id="users" style="display: none;" class="gridContainer"></div>');
		
		var html = '';
		for (var i in items) {
		 	html += writeUserInfoHTML(items[i]);
   		}
		
        $('#users').append(html);
		
		searchUserArgs.offset += items.length;
		bindUserActions();
		displayUsers();
			
		if ($('#users .followItem').length <= 0) {
			$('#feed_loading').hide();
			$('#no_results').show();
		}
	}
	
	function imageLoad(img) {
		$(img).hide();
		$(img).css('opacity', 1);
		$(img).fadeIn(1000);
	}
		
	function writeUserInfoHTML(user) {
		var html = '<div class="followItem">'
				 + '<input type="hidden" class="userId" value="' + user.userId + '" />'
				 + '<a style="color: #333; text-decoration: none;" href="/' + user.username + '">'
				 + '<div class="followItemTitle">'
				 + '<span style="font-weight: bold; font-size: 16px;">' + user.firstname + ' ' + user.lastname + '</span>'
				 + '<br/><span style="margin-left: 5px; opacity: 0.8; font-size: 16px;">@' + user.username + '</span>'
				 + '</div>'
				 + '</a>'
				 + '<a href="/' + user.username + '">'
				 + '<img class="followItemImage" onload="imageLoad(this); style="opacity: 0;" src="' + user.profileImageUrl + '"/>'
				 + '</a>'
				 + '<br/>';
				 
		if (searchUserArgs.userId === user.userId) {
			html += '<h2 style="margin-top: 8px;"><span class="label label-info">you!</span></h2>';
		} else {
			html += '<div class="followButton"' + (user.isFollowing ? 'style="display: none;"' : '') + '><button type="button" class="btn btn-default" style="font-weight: bold;">Follow</button></div>'
		 		 + '<div class="unfollowButton"' + ( ! user.isFollowing ? 'style="display: none;"' : '') + '><button type="button" class="btn btn-primary" style="font-weight: bold; width: 94px;">Following</button>'				 
				 + '</div>';
		}
		
		html += '</div>'
		
		return html;
	}
		
	function loadUserInfos() {
		$.ajax({
    		url: '/ajax/user/getUserItems.php',
    		type: 'POST',
    		data: searchUserArgs,
    		dataType:'json',
    		success: function(items) {
				placeUserInfos(items);
			},
			error: function(a, b, c) {
				displayUsers();
			}
		});
	}
	
	function appendUserInfos() {
		$.ajax({
    		url: '/ajax/user/getUserItems.php',
    		type: 'POST',
    		data: searchUserArgs,
    		dataType:'json',
    		success: function(items) {
				if (items.length <= 0 && ($('#users .followItem').length > 0)) {
					displayUsers();
					$('#noMoreFound').show();
				} else {
					searchUserArgs.offset += items.length;
					
					var html = '';
					for (var i in items) {
						html += writeUserInfoHTML(items[i]);
					}
					
					if (html !== '') {
	        			var $moreUsers = jQuery(html);
	        			
						$('#users').append($moreUsers);
						bindUserActions();
						displayUsers();
	        			$('#users').masonry('appended', $moreUsers); 
					}
				}
			},
			error: function(a, b, c) {
				displayUsers();
			}
		});
	}
	
	function bindUserActions() {		
			$('.unfollowButton').children().mouseout(function () {
				$(this).html('Following');
				$(this).removeClass('btn btn-danger');
				$(this).addClass('btn btn-primary');					
			});
			
			$('.unfollowButton').children().mouseover(function () {
				$(this).html('Unfollow');
				$(this).removeClass('btn btn-primary');
				$(this).addClass('btn btn-danger');			
			});


			$('.followButton').children().click(function () {
				var followDiv = $(this).parent().parent();
				
				if (isLoggedIn) {
					$.ajax({
	    				url: '/ajax/user/followUser.php',
	    				type: 'POST',
	    				data: { 
							userId: followDiv.find('.userId').first().val(),
							followingUserId: searchUserArgs.viewingUserId
						},
	    				dataType:'json'
					});
					
					followDiv.find('.followButton').hide();
					followDiv.find('.unfollowButton').show();
				} else {
					window.location.href = '/login?cont=' + window.location.pathname;
				}		
			});	
			
			$('.unfollowButton').children().click(function () {
				var followDiv = $(this).parent().parent();
				
				if (isLoggedIn) {
					$.ajax({
	    				url: '/ajax/user/unfollowUser.php',
	    				type: 'POST',
	    				data: { 
							userId: followDiv.find('.userId').first().val(),
							followingUserId: searchUserArgs.viewingUserId
						},
	    				dataType:'json'
					});
					
					followDiv.find('.unfollowButton').hide();
					followDiv.find('.followButton').show();	
				} else {
					window.location.href = '/login?cont=' + window.location.pathname;
				}						
			});
	}
	
    /* ------------------------ search nabs ------------------------ */	
	
	function loadNabs(tagId, viewingUserId, beforeId, 
					  limit, vidFileTypeId, audioTypeId, 
					  loggedIn, nabarooTypeId, webTypeId) {
					  	
		$('#nabs').remove();
		$('#wrapper').prepend('<div id="nabs" style="display: none;" class="gridContainer"></div>');
					  	
		mode = 'nabs';
		nabsPlaced = false;
		
		setContainerSize();
		$(window).resize(function() {
			setContainerSize();
		});
		
		$('#no_results').hide();
		$('#noMoreFound').hide();
		$('#feed_scroll_loading').hide();
		$('#users').hide();			
					   	
		$('#feed_loading').show();
		
		searchNabArgs.tagId = tagId;
		searchNabArgs.viewingUserId = viewingUserId;
		searchNabArgs.limit = limit;
		searchNabArgs.beforeId = beforeId;
		
		videoFileTypeId = vidFileTypeId;
		audioFileTypeId = audioTypeId;
		rootUrl = window.location.pathname + window.location.search;
		isLoggedIn = loggedIn;
		nabarooNetworkTypeId = nabarooTypeId;
		webNetworkTypeId = webTypeId;
		
		$('#viewFile').on('hide.bs.modal', function (e) {
			var state = History.getState();
				
			if (state.data.viewArgs !== null && (typeof state.data.viewArgs !== 'undefined')) {
				History.pushState(null, '', rootUrl);
			} else {
				hideNab();
			}
		});	
		
		loadFileItems();
	}
		
	function positionFileItems() {
		$('#nabs').masonry({ 
			itemSelector: '.item' 
		});
	}
		
	function displayFiles() {
		$('#feed_loading').hide();
		$('#feed_scroll_loading').hide();
		$('#nabs').show();
		
		positionFileItems();
	}
		
	function processLoadedFileItems() {
		// bind item actions
		$('.itemDisplay').mouseenter(function() {
			$(this).find('.feedItemActions').show();
			$(this).css('opacity', 0.9);
		});
		
		$('.itemDisplay').mouseleave(function() {
			$(this).find('.feedItemActions').hide();
			$(this).css('opacity', 1);
		});
				
		$('.itemDisplay').each(function() {
			var itemDisplay = $(this);
					
			itemDisplay.find('.nabButton').first().mouseenter(function () {
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
				
		displayFiles();
	}
		
	function placeFileItems(items) {
		if (nabsPlaced) {
			return;
		} else {
			nabsPlaced = true;
		}
		
		var html = '';	
		
		for (var i in items) {
	 		html += writeFileItemHTML(items[i], true);
   		}
		
        $('#nabs').append(html);
		searchNabArgs.beforeId = items.length > 0 
								? items[items.length - 1].fileId 
								: searchNabArgs.beforeId;
		
		processLoadedFileItems();
			
		if ($('#nabs .item').length <= 0) {
			$('#feed_loading').hide();
			$('#no_results').show();
		}
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
			isMediaSet : item.find('.isMediaSet').val() === 'true',
			playerHTML : item.find('.playerHTML').html(),
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
		
		if (args.existingFile) {
			History.pushState({viewArgs : args}, '', $(btn).prop('href'));
		} else {
			viewFile(args);
			$('#viewFile').modal('show');
		}
		
		return false;
	}
	
	function unlike(btn) {
		var item = $(btn).parent().parent().parent().parent();
		
		$.ajax({
    		url: '/ajax/file/unlike.php',
    		type: 'POST',
    		data: {
				fileId : parseInt(item.find('.fileId').val()),
				userId : searchNabArgs.viewingUserId	
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
			window.location.href = '/login?cont=' + window.location.pathname + window.location.search;
			return;
		}
		
		var item = $(btn).parent().parent().parent().parent();
		
		$.ajax({
    		url: '/ajax/file/like.php',
    		type: 'POST',
    		data: {
				fileId : parseInt(item.find('.fileId').val()),
				userId : searchNabArgs.viewingUserId	
			},
    		dataType:'json'
		});
		
		item.find('.isLiked').val('true');
		item.find('.likeCount').val(parseInt(item.find('.likeCount').val()) + 1);
		item.find('.likeContainer').hide();
		item.find('.unlikeContainer').show();
	}
	
	function getDisplayItemHeight(nativeHeight, nativeWidth) {
		return (nativeHeight * feedItemWidth) / nativeWidth;
	}	
		
	function writeFileItemHTML(fileItem, positionOnLoad) {
		var height = getDisplayItemHeight(fileItem.displayHeight, fileItem.displayWidth);
		var isHidden = height > 600;
		
		var html = '<div class="item">'
				 + '<a class="viewFile" href="/n/' + fileItem.alphaId + '" onclick="viewNab(this); return false;">'
				 + '<div class="itemDisplay"' + (isHidden ? ' style="max-height: 450px; overflow: hidden;"' : '') + '>'
		
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
			 + '<a class="nabButton" data-toggle="modal" data-target="#nabFile" onclick="nab(this); return false;">'
			 + '<img src="/images/add_ribbon1.png"/>'
			 + '</a></div>';
			 
			 
		html += '<div class="feedItemActions">'
			 + '<a class="nabButton" data-toggle="modal" data-target="#nabFile" onclick="nab(this); return false;">'
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
			  + '<input type="hidden" class="note" value="' + fileItem.note + '"/>'
			  + '<input type="hidden" class="tags" value="' + (exists(fileItem.tags) ? fileItem.tags : '') + '"/>'
			  + '<input type="hidden" class="actualFileId" value="' + fileItem.actualFileId + '"/>'
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
		
	function loadFileItems() {
		$.ajax({
    		url: '/ajax/search/getTaggedNabs.php',
    		type: 'POST',
    		data: searchNabArgs,
    		dataType:'json',
    		success: function(items) {
				placeFileItems(items);		
			},
			error: function(a, b, c) {
				displayFiles();
			}
		});
	}
	
	function appendFileItems() {
		$.ajax({
    		url: '/ajax/search/getTaggedNabs.php',
    		type: 'POST',
    		data: searchNabArgs,
    		dataType:'json',
    		success: function(items) {
				if (items.length <= 0 && ($('#nabs .item').length > 0)) {
					displayFiles();
					$('#noMoreFound').show();
				} else {
					searchNabArgs.beforeId = items.length > 0 
											? items[items.length - 1].fileId 
											: searchNabArgs.beforeId;
					
					var html = '';
					for (var i in items) {
						html += writeFileItemHTML(items[i], false);
					}
					
        			var $moreFiles = jQuery(html);
        			$('#nabs').append($moreFiles);
					processLoadedFileItems();
        			$('#nabs').masonry('appended', $moreFiles);  
				}
			},
			error: function(a, b, c) {
				displayFiles();
			}
		});
	}
	
	function removeFile(fileId) {
		var item = $('.actualFileId[value="' + fileId + '"]').parent();
		$('#feed').masonry('remove', item);
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