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
				appendFeedItems();
    		}
		});
		
		    History.Adapter.bind(window, 'statechange', function() {
				historyIsLoaded = true;
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
	var maxFeedItemsToDisplay = 25;
	var videoFileTypeId;
	var audioFileTypeId;
	var feedArgs = [];
	var argsLoaded = 0;
	var newFeedItems = [];
	var viewingUsername = '';
	var viewingUserId = 0;
	var requests = [];
	var popularTags = [];
	var feedSurplus = [];
	var followSuggestions = [];
	var rootUrl;
	var nabarooNetworkTypeId;
	var webNetworkTypeId;
	
	function getDisplayItemHeight(nativeHeight, nativeWidth) {
		return (nativeHeight * feedItemWidth) / nativeWidth;
	}
		
	function loadDiscoverFeed(args, vidFileTypeId, audioTypeId, username, userId, tags, suggestions, nabarooTypeId, webTypeId) {
    	$('#feed_scroll_loading').hide();		 
		$('#noMoreFound').hide();		
		$('#feed_loading').hide();		
		
		
		rootUrl = window.location.pathname;
		popularTags = tags;
		followSuggestions = suggestions;
		$('#noDataFoundMessage').hide();
		$('#feed').remove();
		$('<div id="feed" style="display: none;" class="gridContainer"></div>').insertAfter('#searchNetworks');	
		
		$('#feed_loading').show();
		feedArgs = args;
		nabarooNetworkTypeId = nabarooTypeId;
		webNetworkTypeId = webTypeId;
		
		viewingUsername = username;
		viewingUserId = userId;
		
		videoFileTypeId = vidFileTypeId;
		audioFileTypeId = audioTypeId;
		
		$('#viewFile').on('hide.bs.modal', function (e) {
			var state = History.getState();
				
			if (state.data.viewArgs !== null && (typeof state.data.viewArgs !== 'undefined')) {
				History.pushState(null, '', rootUrl);
			} else {
				hideNab();
			}
		});		
		
		for (var i in requests) {
			requests[i].abort();
		}
		
		newFeedItems = [];
		requests = [];
		feedSurplus = [];
		loadFeedItems();
	}
		
	function positionFeedItems() {
		$('#feed').masonry({ 
			itemSelector: '.item' 
		});
	}
		
	function displayFeed() {
		$('#feed_loading').hide();
		$('#feed_scroll_loading').hide();
		$('#feed').show();
		
		positionFeedItems();
	}
		
	function processLoadedItems() {
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
		
	function placeFeedItems(items) {
		var html = '';
		
		html += writeInvitesHTML();
		
		for (var i in items) {
	 		html += writeFeedItemHTML(items[i], true);
   		}
		
        $('#feed').append(html);
		processLoadedItems();
			
		if ($('.item').length < 2) {
			$('#feed_loading').hide();
			$('#noDataFoundMessage').show();
		}
	}
	
	function imageLoad(img) {
		$(img).hide();
		$(img).css('opacity', 1);
		$(img).fadeIn(1000);
	}
	
	/*
	function editNab(btn) {
		var item = $(btn).parent().parent().parent();
		
		editFile({
			collectionId : parseInt(item.find('.collectionId').val()),
			fileId : parseInt(item.find('.fileId').val()),
			networkTypeId : parseInt(item.find('.networkTypeId').val()),
			networkFileId : item.find('.networkFileId').val(),
			displayUrl : item.find('.displayImageUrl').val(),
			note : item.find('.note').val(),
			name : item.find('.itemText').html()
		});		
	}		
	*/
	
	function nab(btn) {
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
			textHTML : (item.find('.itemText').html().length > 0 || item.find('.tags').val().length > 0) ? item.find('.itemTextHTML').html() : '',
			playerHTML : item.find('.playerHTML').html(),
			isMediaSet : item.find('.isMediaSet').val() === 'true',
			note : item.find('.note').val(),
			collectionName : item.find('.collectionName').val(),
			collectionOwnerUsername : item.find('.collectionOwnerUsername').val(),
			fullname : item.find('.fullname').val(),
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
				userId : viewingUserId	
			},
    		dataType:'json'
		});
		
		item.find('.isLiked').val('false');
		item.find('.likeCount').val(parseInt(item.find('.likeCount').val()) - 1);
		item.find('.unlikeContainer').hide();
		item.find('.likeContainer').show();
	}

	function like(btn) {
		var item = $(btn).parent().parent().parent().parent();
		
		$.ajax({
    		url: '/ajax/file/like.php',
    		type: 'POST',
    		data: {
				fileId : parseInt(item.find('.fileId').val()),
				userId : viewingUserId	
			},
    		dataType:'json'
		});
		
		item.find('.isLiked').val('true');
		item.find('.likeCount').val(parseInt(item.find('.likeCount').val()) + 1);
		item.find('.likeContainer').hide();
		item.find('.unlikeContainer').show();
	}
	
		function homeSuggestionFollow(btn) {
			var container = $(btn).parent();

			$.ajax({
	    		url: '/ajax/user/followUser.php',
	    		type: 'POST',
	    		data: { 
					userId: container.find('.userId').val(),
					followingUserId: viewingUserId
				},
	    		dataType: 'json'
			});
					
			container.find('.homeFollow').hide();
			container.find('.homeUnfollow').show();
			
			return false;
		}
		
		function homeSuggestionUnfollow(btn) {
			var container = $(btn).parent();

			$.ajax({
	    		url: '/ajax/user/unfollowUser.php',
	    		type: 'POST',
	    		data: { 
					userId: container.find('.userId').val(),
					followingUserId: viewingUserId
				},
	    		dataType: 'json'
			});
					
			container.find('.homeUnfollow').hide();
			container.find('.homeFollow').show();
			
			return false;
		}
	
	function writeInvitesHTML() {
		if (popularTags.length <= 0 && followSuggestions.length <= 0) {
			return '';
		}
		
		var height = followSuggestions.length > 0 ? 70 : 21;
		
		for (var i in followSuggestions) {
			height += exists(followSuggestions[i].descriptionHTML) ? 58 : 45;
		}
		
		height += 45;
		
		var html = '<div class="item" style="height: ' + (popularTags.length > 0 ? (height + 148 + 'px') : (height + 'px')) + ';">';

		if (followSuggestions.length > 0) {
			html += '<h4 style="margin-left: 10px;"><span style="opacity: 0.7;">Who to follow · </span><a onclick="viewFollowSuggestions();" style="font-size: 12px;" href="javascript:void(0)">View all</a></h4>'
				  + '<ul style="list-style: none; margin: 10px; padding: 0px;">';
				  
			for (var i in followSuggestions) {
				var fullname = followSuggestions[i].firstname + ' ' + followSuggestions[i].lastname;
				var username = followSuggestions[i].username;
				
				if (fullname.length >= 19) {
					fullname = fullname.substring(0, 19 - 3) + '...';
					username = '';
				} else {
					var remainingChars = 19 - fullname.length;
					if (username.length > remainingChars) {
						username = remainingChars > 3 ? username.substring(0, remainingChars - 3) + '...' : '...';
					}
				}
				
				html += '<li style="margin-bottom: 5px; min-height: 45px;">'
					 + '<input class="userId" type="hidden" value="' + followSuggestions[i].userId + '" />'
					 + '<a href="/' + followSuggestions[i].username + '"><img src="' + followSuggestions[i].profileImageUrl + '" style="width: 40px; height: 40px; border-radius: 35px; float: left; margin-right: 5px;" /></a>'
					 + '<a href="/' + followSuggestions[i].username + '" style="color: #333;"><span style="float: left; font-weight: bold; margin-right: 3px;">' + fullname + '</span><span style="float: left; opacity: 0.7;">@' + username + '</span></a>'
					 + '<br/>';
					 
					 if (exists(followSuggestions[i].descriptionHTML)) {
					 	html += '<div style="font-size: 12px; width: 170px; height: 18px; overflow: hidden; word-break: break-all;">' + followSuggestions[i].descriptionHTML + '</div>';
					 }
					 
				html += '<a class="homeFollow" href="javascript:void(0)" onclick="homeSuggestionFollow(this);">Follow</a>'
					 + '<a style="display: none;" class="homeUnfollow" href="javascript:void(0)" onclick="homeSuggestionUnfollow(this);">Unfollow</a>'
					 + '</li>';
			}
			
			html += '</ul>';
		}
		
		html += '<button type="button" onclick="viewInviteUsers(); return false;" class="btn btn-default" style="margin-left: 10px; margin-right: 10px; width: 216px; outline: none;"><span class="glyphicon glyphicon-send"></span>&nbsp; Send an Invite</button>';
		
		if (popularTags.length > 0) {
			html += '<h4 style="margin-left: 10px;"><span style="opacity: 0.7;">Popular tags</h4><ul style="list-style: none; margin: 10px; padding: 0px;">';
			for (var i in popularTags) {
				html += '<li style="margin-bottom: 5px;">'
					 + '<a href="/search?q=' + encodeURIComponent(popularTags[i].name) + '">#' + popularTags[i].name + '</a>'
					 + '</li>';
			}
			
			html += '</ul>';
		}
		
		html += '</div>';
			  
		return html;
	}
	
	function writeFeedItemHTML(feedItem, positionOnLoad) {
		var height = getDisplayItemHeight(feedItem.displayImageHeight, feedItem.displayImageWidth);
		var isExistingFile = feedItem.collectionInfo !== null && (typeof feedItem.collectionInfo !== 'undefined');
		var isHidden = height > 600;
					
		var html = '<div class="item">'
				 + '<a class="viewFile" ' + (isExistingFile ? ('href="/n/' + feedItem.collectionInfo.alphaId + '"') : '') + ' onclick="viewNab(this); return false;">'
				 + '<div class="itemDisplay"' + (isHidden ? ' style="max-height: 450px; overflow: hidden;"' : '') + '>';
				 
		if (feedItem.isMediaSet) {
			var urls = feedItem.sourceUrl.split(' ');
			var isFirstPhoto = true;
			for (var i in urls) {
				html += '<img class="itemImg" onload="imageLoad(this); ' + ((urls.length - 1 === parseInt(i)) ? 'positionFeedItems();' : '') + '" style="opacity: 0;' + ( ! isFirstPhoto ? ' margin-top: 5px;' : '') + ' width: ' + feedItemWidth + 'px;" src="' + urls[i] + '"/>';
				isFirstPhoto = false;
			}
		} else {
			html += '<img class="itemImg" onload="imageLoad(this); ' + (positionOnLoad ? 'positionFeedItems();' : '') + '" style="opacity: 0; height: ' + height + 'px; width: ' + feedItemWidth + 'px;" src="' + ((feedItem.displayImageUrl !== null && (typeof feedItem.displayImageUrl !== 'undefined') && feedItem.displayImageUrl.length > 0) ? feedItem.displayImageUrl : '/images/blankVideo.jpg') + '"/>';
		}
					 
		if (feedItem.fileTypeId === videoFileTypeId || feedItem.fileTypeId === audioFileTypeId) {
			html += '<img class="play-button" src="/images/play-video-button.png"/>';
		}
			 
		html += '<div class="feedItemActions">'
			 + '<a class="nabButton" data-toggle="modal" data-target="#nabFile" onclick="nab(this); return false;">'
			 + '<img src="/images/add_ribbon1.png"/></a>';
			 
		if (isExistingFile && feedItem.collectionInfo.username === viewingUsername) {
		 	html += '<a class="editFile" data-toggle="modal" data-target="#editNab" style="text-decoration: none; cursor: pointer;" onclick="editNab(this); return false;">'
		 		 + '<img src="/images/edit_circle.png"/>'
		         + '</a>';
		} else if (isExistingFile) {
			html += '<div class="likeContainer"' + (feedItem.collectionInfo.isLiked ? ' style="display: none;" ' : '') + '><button onclick="like(this); return false;" type="button" class="btn btn-default" style="float: right; position: absolute; border-radius: 60px; top: 8px; left: 8px; width: 48px; height: 48px; padding: 0px; outline: none;">'
				 + '<span class="glyphicon glyphicon-heart" style="font-size: 20px; color: #333;"></span>'
				 + '</button></div>';
					 
			html += '<div class="unlikeContainer"' + ( ! feedItem.collectionInfo.isLiked ? ' style="display: none;" ' : '') + '><button onclick="unlike(this); return false;" type="button" class="btn btn-default" style="float: right; position: absolute; border-radius: 60px; top: 8px; left: 8px; width: 48px;height: 48px;padding: 0px;outline: none;">'
			 	 + '<span class="glyphicon glyphicon-heart" style="font-size: 20px; color: #FF5151;"></span>'
				 + '</button></div>';
		}			 
			 
		html += '</div>';
		
		if (isHidden) {
			html += '<h3><span class="label label-default" style="position: absolute; bottom: 0px; z-index: 10; width: 236px; border-radius: 0px;" onclick="viewFullSize(this);">Click to view full size</span></h3>';
		}
					 
		var text = (feedItem.text !== null && (typeof feedItem.text !== 'undefined') && feedItem.text.length > 0) ? feedItem.text : '';
		var textHTML = (exists(feedItem.textHTML) && feedItem.textHTML.length > 0) ? feedItem.textHTML : text;
		var noMetaData = (text === '' && feedItem.textHTML === '' && ! exists(feedItem.collectionInfo.viaAlphaId) && feedItem.networkTypeId !== webNetworkTypeId);
		
		html += '</div></a>'
			 + (noMetaData ? '' : '<br/><br/>')
	         + (textHTML.length > 0 ? ('<div class="itemData">' + textHTML + '</div>') : '')
			 + '<div class="itemText">' + text + '</div>'
			 + '<div class="itemTextHTML">' + textHTML + '</div>'
			 + '<div class="playerHTML">' + (feedItem.playerHTML !== null ? feedItem.playerHTML : '') + '</div>'
	         + '<div class="itemData sub" style="margin-bottom: 0px;' + (noMetaData ? 'display: none;' : '') + '">';
					 
	    if (feedItem.networkInfo !== null && (typeof feedItem.networkInfo !== 'undefined')) {
			var searchUrl = '/user?u=' + encodeURIComponent(feedItem.networkInfo.username) + '&n=' + feedItem.networkTypeId + '&id=' + feedItem.networkInfo.userId;
			html += '<a href="' + searchUrl + '"><img class="itemProfileImg" style="margin-right: 4px;" src="' + feedItem.networkInfo.userProfileImageUrl + '" /></a>'
				 + '<a class="itemUserLink" href="' + searchUrl + '">' + feedItem.networkInfo.username + '</a>'
				 + '<br/><br/><br/>'
				 + '<img style="float: left; width: 16px; opacity: 0.5;" src="/images/clock.png"/>'
				 + '<span style="opacity: 0.5; font-weight: normal; float: left;"> ' + getFeedItemDate(feedItem.timestamp) + '</span>'
			  	 + '<img style="float: right; border-radius: 4px; margin-bottom: 12px;" src="' + feedItem.networkIconUrl + '"/>';
		} else {
			if (feedItem.networkTypeId === nabarooNetworkTypeId || feedItem.networkTypeId === 5 || feedItem.networkTypeId === 9) {
				// do nothing
			} else if (feedItem.networkTypeId === webNetworkTypeId) {
				if ( ! exists(feedItem.collectionInfo.viaAlphaId)) {
					var site = feedItem.collectionInfo.networkId.length > 21 ? feedItem.collectionInfo.networkId.substring(0, 18) + '...' : feedItem.collectionInfo.networkId;
					html += '<a target="_blank" style="color: black;" href="' + feedItem.collectionInfo.networkFileId + '">Found on ' + site + '</a>';					
				}		
			} else {		
				var searchUrl = '/user?u=' + encodeURIComponent(feedItem.collectionInfo.networkUsername) + '&n=' + feedItem.networkTypeId + '&id=' + feedItem.collectionInfo.networkId;
				html += '<a class="itemUserLink" href="' + searchUrl + '"><img style="margin-right: 4px; width: 14px;" src="' + feedItem.networkIconUrl + '"/>' + feedItem.collectionInfo.networkUsername + '</a>';			
			}
		}
		
		if (isExistingFile && exists(feedItem.collectionInfo.viaAlphaId)) {
			html += '<a class="itemUserLink" href="/n/' + feedItem.collectionInfo.viaAlphaId + '"><span class="glyphicon glyphicon-retweet" style="margin-right: 2px;"></span> renabbed from ' + feedItem.collectionInfo.viaFullname + '</a>';		
		}
		
		/*
		if (isExistingFile && (feedItem.collectionInfo.renabCount > 0 || feedItem.collectionInfo.likeCount > 0)) {
			if (feedItem.networkTypeId === webNetworkTypeId || (isExistingFile && exists(feedItem.collectionInfo.viaAlphaId))) {
				html += '<br/><br/>';
			}
			
			if (feedItem.collectionInfo.renabCount > 0) {
				html += '<span style="float: left; font-weight: normal; color: #717171;"><span class="glyphicon glyphicon-bookmark" style="margin-right: 2px;"></span>' + feedItem.collectionInfo.renabCount + '</span>';
			}
			
			if (feedItem.collectionInfo.likeCount > 0) {
				html += '<span style="float: left; font-weight: normal;' + (feedItem.collectionInfo.renabCount > 0 ? 'margin-left: 5px;' : '') + 'color: #717171;"><span class="glyphicon glyphicon-heart" style="margin-right: 2px;"></span>' + feedItem.collectionInfo.likeCount + '</span>';
			}
			
			html += '<br/>';
		}
		*/

		html += '</div>'
			  + '<input type="hidden" class="isExistingFile" value="' + isExistingFile + '"/>'
			  + '<input type="hidden" class="isMediaSet" value="' + feedItem.isMediaSet + '"/>'
			  + '<input type="hidden" class="fileId" value="' + (isExistingFile ? feedItem.collectionInfo.fileId : '0') + '"/>'
			  + '<input type="hidden" class="note" value="' + (isExistingFile ? feedItem.collectionInfo.note : '') + '"/>'
			  + '<input type="hidden" class="fileTypeId" value="' + feedItem.fileTypeId + '"/>'
			  + '<input type="hidden" class="path" value="' + feedItem.sourceUrl + '"/>'
			  + '<input type="hidden" class="networkTypeId" value="' + feedItem.networkTypeId + '"/>'
			  + '<input type="hidden" class="networkFileId" value="' + (isExistingFile ? feedItem.collectionInfo.networkFileId : (feedItem.networkInfo.fileId !== null ? feedItem.networkInfo.fileId : '')) + '"/>'
			  + '<input type="hidden" class="networkTimestamp" value="' + (isExistingFile ? feedItem.collectionInfo.networkTimestamp : feedItem.timestamp) + '"/>'
			  + '<input type="hidden" class="networkUsername" value="' + (isExistingFile ? feedItem.collectionInfo.networkUsername : feedItem.networkInfo.username) + '"/>'
			  + '<input type="hidden" class="networkId" value="' + (isExistingFile ? feedItem.collectionInfo.networkId : feedItem.networkInfo.userId) + '"/>'			
			  + '<input type="hidden" class="networkProfileImageUrl" value="' + (isExistingFile ? feedItem.collectionInfo.networkProfileImageUrl : feedItem.networkInfo.userProfileImageUrl) + '"/>'
			  + '<input type="hidden" class="displayImageUrl" value="' + feedItem.displayImageUrl + '"/>'
			  + '<input type="hidden" class="displayImageWidth" value="' + feedItem.displayImageWidth + '"/>'
			  + '<input type="hidden" class="displayImageHeight" value="' + feedItem.displayImageHeight + '"/>'
			  + '<input type="hidden" class="networkIconUrl" value="' + feedItem.networkIconUrl + '"/>'
			  + '<input type="hidden" class="collectionName" value="' + (isExistingFile ? feedItem.collectionInfo.name : '') + '"/>'
			  + '<input type="hidden" class="collectionOwnerUsername" value="' + (isExistingFile ? feedItem.collectionInfo.ownerUsername : '') + '"/>'
			  + '<input type="hidden" class="profileImageUrl" value="' + (isExistingFile ? feedItem.collectionInfo.profileImageUrl : '') + '"/>'			  
			  + '<input type="hidden" class="fullname" value="' + (isExistingFile ? (feedItem.collectionInfo.firstname + ' ' + feedItem.collectionInfo.lastname) : '') + '"/>'
			  + '<input type="hidden" class="isLiked" value="' + (isExistingFile ? feedItem.collectionInfo.isLiked : '') + '"/>'
			  + '<input type="hidden" class="username" value="' + (isExistingFile ? feedItem.collectionInfo.username : '') + '"/>'
			  + '<input type="hidden" class="likeCount" value="' + (isExistingFile ? feedItem.collectionInfo.likeCount : '') + '"/>'
			  + '<input type="hidden" class="renabCount" value="' + (isExistingFile ? feedItem.collectionInfo.renabCount : '') + '"/>'
			  + '<input type="hidden" class="timestamp" value="' + (isExistingFile ? feedItem.timestamp : '') + '"/>'
			  + '<input type="hidden" class="tags" value="' + (exists(feedItem.collectionInfo.tags) ? feedItem.collectionInfo.tags : '') + '"/>'
			  + '<input type="hidden" class="actualFileId" value="' + (exists(feedItem.collectionInfo.actualFileId) ? feedItem.collectionInfo.actualFileId : '') + '"/>'
			  + '<input type="hidden" class="note" value="' + (isExistingFile ? feedItem.collectionInfo.note : '') + '"/>'
			  + '<input type="hidden" class="viaAlphaId" value="' + (isExistingFile ? (exists(feedItem.collectionInfo.viaAlphaId) ? feedItem.collectionInfo.viaAlphaId : '') : '') + '"/>'
			  + '<input type="hidden" class="viaFullname" value="' + (isExistingFile ? (exists(feedItem.collectionInfo.viaFullname) ? feedItem.collectionInfo.viaFullname : '') : '') + '"/>';			  
		
		if (isExistingFile) {
			html += '<hr style="margin-bottom: 0px; margin-top: 0px;"/>'
			     + '<a href="/' + feedItem.collectionInfo.ownerUsername + '/' + getUrlSafeCollectionName(feedItem.collectionInfo.name) + '">'
				 + '<div class="nabCollectionInfoWrapper"><div class="nabCollectionInfo">'
				 + '<img src="' + feedItem.collectionInfo.profileImageUrl + '" class="nabCollectionCover" />'
				 + '<span style="font-size: 12px; color: #333;"><b>' 
				 + feedItem.collectionInfo.firstname + ' ' + feedItem.collectionInfo.lastname 
				 + '</b> nabbed to <b>' + feedItem.collectionInfo.name + '</b>';
				 
				 if (exists(feedItem.collectionInfo.note) && feedItem.collectionInfo.note !== '') {
			 	 	html += ' and noted <b>"' + feedItem.collectionInfo.note + '"</b>';
			 	 }
				 
			html += '</span>'			 
				 + '</div></div></a>';
		}
			 
		html += '</div>';
			  
		return html;
	}
	
	/*
	function configArgs() {
		if (newFeedItems.length < maxFeedItemsToDisplay) {
			newFeedItems.sort(function(x, y) {
    			return x.timestamp - y.timestamp;
			});
			
			for (var i in feedArgs) {
				if (feedArgs[i].user !== 'undefined' && feedArgs[i].user !== null) {
					for (var j in newFeedItems) {
						if (newFeedItems[j].networkTypeId === networkTypeIdNabaroo) {
							feedArgs[i].beforeTimestamp = newFeedItems[j].timestamp;
							break;
						}
					}
				} else {
					for (var k in newFeedItems) {
						if (feedArgs[i].networkUser.networkTypeId === newFeedItems[k].networkTypeId) {
							feedArgs[i].beforeId = newFeedItems[k].networkInfo.postId;
							feedArgs[i].beforeTimestamp = newFeedItems[k].timestamp;
							break;
						}
					}					
				}
			}
		}
	}
	*/
		
	function loadFeedItems() {
		argsLoaded = 0;
		for (var i in feedArgs) {
			var request = $.ajax({
    			url: '/ajax/discover/getFeedContent.php',
    			type: 'POST',
    			data: feedArgs[i],
    			dataType:'json',
    			success: function(resp) {
					for (var j in resp.data) {
						newFeedItems.push(resp.data[j]);
					}
					
					if (feedArgs.length > 1) {
						feedArgs[resp.args.feedArgsIndex] = resp.args;	
					} else {
						feedArgs[0] = resp.args;
					}					
					
					argsLoaded++;							
					
					if (argsLoaded === feedArgs.length) {
						newFeedItems = newFeedItems.concat(feedSurplus);
						
						if (newFeedItems.length > 25) {
							var final = newFeedItems.slice(0, 25);
							feedSurplus = newFeedItems.slice(25);
							newFeedItems = final;
						} else {
							feedSurplus = [];
						}						
						
						//if (newFeedItems.length > maxFeedItemsToDisplay) {
						//	newFeedItems = newFeedItems.slice(0, maxFeedItemsToDisplay - 1);
						//}
						
						placeFeedItems(newFeedItems);
						//configArgs();
						
						newFeedItems = [];
						argsLoaded = 0;
						displayFeed();
					}	
				},
				error: function(a, b, c) {
					if (b === 'abort') {
						return;
					}					

					argsLoaded++;
					
					if (argsLoaded === feedArgs.length) {
						//if (newFeedItems.length > maxFeedItemsToDisplay) {
						//	newFeedItems = newFeedItems.slice(0, maxFeedItemsToDisplay - 1);
						//}
						
						placeFeedItems(newFeedItems);
						//configArgs();
						
						newFeedItems = [];
						argsLoaded = 0;
						displayFeed();
					}
				}
			});
			
			requests.push(request);		
		}
	}
	
	function appendFeedItems() {
		argsLoaded = 0;
		for (var i in feedArgs) {
			var request = $.ajax({
    			url: '/ajax/discover/getFeedContent.php',
    			type: 'POST',
    			data: feedArgs[i],
    			dataType:'json',
    			success: function(resp) { 
					for (var j in resp.data) {
						newFeedItems.push(resp.data[j]);
					}
					
					if (feedArgs.length > 1) {
						feedArgs[resp.args.feedArgsIndex] = resp.args;	
					} else {
						feedArgs[0] = resp.args;
					}
					
					argsLoaded++;
					
					if (argsLoaded === feedArgs.length) {
						if (newFeedItems.length <= 0 && feedSurplus.length <= 0 && ($('.item').length > 0)) {
							newFeedItems = [];
							argsLoaded = 0;
							displayFeed();
							$('#noMoreFound').show();
						} else {
							newFeedItems = newFeedItems.concat(feedSurplus);
							
							if (newFeedItems.length > 25) {
								var final = newFeedItems.slice(0, 25);
								feedSurplus = newFeedItems.slice(25);
								newFeedItems = final;
							} else {
								feedSurplus = [];
							}	
							
						
							var html = '';
							for (var i in newFeedItems) {
								html += writeFeedItemHTML(newFeedItems[i], false);
							}
					
        					var $moreFiles = jQuery(html);
        					$('#feed').append($moreFiles);
							processLoadedItems();
							
							//configArgs();
							newFeedItems = [];
							argsLoaded = 0;
							displayFeed();
        					$('#feed').masonry('appended', $moreFiles);
						} 
					}
				},
				error: function(a, b, c) {
					if (b === 'abort') {
						return;
					}					
				
					argsLoaded++;
					
					if (argsLoaded === feedArgs.length) {
						
						//if (newFeedItems.length > maxFeedItemsToDisplay) {
						//	newFeedItems = newFeedItems.slice(0, maxFeedItemsToDisplay - 1);
						//}	
							
						var html = '';
						for (var i in newFeedItems) {
							html += writeFeedItemHTML(newFeedItems[i], false);
						}
					
        				var $moreFiles = jQuery(html);
        				$('#feed').append($moreFiles);
						processLoadedItems();
						
						//configArgs();						
						newFeedItems = [];
						argsLoaded = 0;
						displayFeed();
        				$('#feed').masonry('appended', $moreFiles); 
					}
				}
			});
			
			requests.push(request);
		}
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