	$(function () {
		bindTabActions();
		setCollectionContainerSize();
		$(window).resize(function() {
			setCollectionContainerSize();
		});
		
		$(window).scroll(function() {
			if ($('#collectionsNavItem').hasClass('active')
			    && ! $('#scroll_loading').is(':visible') 
				&& ! $('#noMoreFound').is(':visible')
				&& ! $('#noCollectionsFound').is(':visible')
				&& ! $('#collectionsLoading').is(':visible')
				&& ($(window).scrollTop() + $(window).height() > $(document).height() - 400)) {
       	 		
				$('#scroll_loading').show();
				appendCollections();
    		}
		});
	});	

	var args = {
		canEdit : false,
		userId : 0,
		limit : 0,
		beforeTimestamp : 0,
		beforeSharedTimestamp : 0,
		category : 'all'
	};
	
	var latestCollectionTimestamp = 0;
	var addCollectionWritten = false;
	
	function positionItems() {
		$('#collections').masonry({ 
			itemSelector: '.collectionItem' 
		});
	}
		
		function displayCollections() {
			$('#collectionsLoading').hide();
			$('#scroll_loading').hide();
			
			if ($('#collectionsNavItem').hasClass('active')) {
				$('#collections').show();
			}
		}
		
		function bindTabActions() {
			$('#yourCollectionTabAll a').click(function() {
				clearTabs();
				$(this).css('background-color', '#333').css('color', '#FFF');
				
				latestCollectionTimestamp = getUnixTimestamp();
				addCollectionWritten = false;
				args.beforeTimestamp = getUnixTimestamp();
				args.beforeSharedTimestamp = args.beforeTimestamp;
				args.category = 'all';
				
				loadAllCollections();
				
				$(this).addClass('collectionTabActive');
				$(this).css('border-top-left-radius', 0);
				$(this).css('border-bottom-left-radius', 0);
			});
		
			$('#yourCollectionTabSharing a').click(function() {
		     	clearTabs();
				$(this).css('background-color', '#333').css('color', '#FFF');
				
				latestCollectionTimestamp = getUnixTimestamp();
				addCollectionWritten = false;				
				loadSharingCollections(getUnixTimestamp());
								
				$(this).addClass('collectionTabActive');
				$(this).css('border-top-right-radius', 0);
				$(this).css('border-bottom-right-radius', 0);
			});
			
			$('#yourCollectionTabPrivate a').click(function() {
				clearTabs();
				$(this).css('background-color', '#333').css('color', '#FFF');

				latestCollectionTimestamp = getUnixTimestamp();
				addCollectionWritten = false;				
				args.beforeTimestamp = getUnixTimestamp();
				args.beforeSharedTimestamp = args.beforeTimestamp;
				args.category = 'private';
				
				loadPrivateCollections();					
				
				$(this).addClass('collectionTabActive');
			});
		
			$('#yourCollectionTabSyncs a').click(function() {
				clearTabs();
				$(this).css('background-color', '#333').css('color', '#FFF');
				latestCollectionTimestamp = getUnixTimestamp();
				addCollectionWritten = false;
				loadSyncCollections(getUnixTimestamp());
				$(this).addClass('collectionTabActive');
			});
		
			$('#yourCollectionTabShared a').click(function() {
				clearTabs();
				$(this).css('background-color', '#333').css('color', '#FFF');
				
				latestCollectionTimestamp = getUnixTimestamp();
				addCollectionWritten = false;
				args.beforeTimestamp = getUnixTimestamp();
				args.beforeSharedTimestamp = args.beforeTimestamp;
				args.category = 'shared';
				
				loadSharedCollections();					
				
				$(this).addClass('collectionTabActive');
			});					
		}
		
		function bindActions() {
				$('.collectionItemDisplay').hover(function() {
					$(this).find('.colectionItemActions').show();
					$(this).css('opacity', 0.9);
				});
			
				$('.collectionItemDisplay').mouseleave(function() {
					$(this).find('.colectionItemActions').hide();
					$(this).css('opacity', 1);
				});
				
				$('.collectionItemDisplay').each(function() {
					var itemDisplay = $(this);
					
					itemDisplay.find('.editCollection').first().hover(function () {
						itemDisplay.css('opacity', 1);
					});	
					
					itemDisplay.find('.editCollection').first().mouseleave(function () {
						itemDisplay.css('opacity', 0.9);
					});	
				});
				
				displayCollections();
				positionItems();
		} 
		
		function writeAddCollection() {
			var html = '<div class="collectionItem">'
					 + '<div class="collectionitemDisplay">'
					 + '<a data-toggle="modal" data-target="#editCollection" style="text-decoration: none; cursor: pointer;" onclick="createCollection();">'
					 + '<div class="addCollection" />'
					 + '<div class="collectionName">Create a collection</div>'
					 + '</a>'
					 + '</div></div>';
			
			return html;
		}
		
	    function writeItemHTML(collection) {
			var maxNameLength = collection.isShared ? 12 : 20;
			
			var html = '<div class="collectionItem"><input type="hidden" class="collectionId" value="' + collection.collectionId + '" />'
					 + '<div class="collectionitemDisplay">'
					 + '<a style="text-decoration: none;" class="collectionLink" href="/' + collection.createdByUsername + '/' + getUrlSafeCollectionName(collection.name) + '">'
					 + '<div>'
					 + '<div style="background-image: url(\'' + collection.coverImageUrl + '\');" class="collection" />'
					 + '<div class="collectionName">' + (collection.name.length > maxNameLength ? (collection.name.substring(0, maxNameLength - 3) + '...') : collection.name)
					 + (collection.isShared ? '<span class="collectionShared">(shared)</span>' : '')
					 + '</div></div>'
					 + '</a>';
					 				 	
					 if (args.canEdit && ! collection.isShared) {
					 	html += '<div class="editCollection">'
					 		 + '<a data-toggle="modal" data-target="#editCollection" onclick="editCollection(' + collection.collectionId + ');" class="editCollectionLink">'
					         + '<img src="/images/edit_circle.png"/>'
					         + '</a>'
					         + '</div>';					 	
					 }
			
			html += '</div></div>';
			return html;
		}
		
		function getUnixTimestamp() {
			return new Date()/1000;
		}
		
		function loadCollections(userId, limit, canEdit) {
			setCollectionContainerSize();
			$(window).resize(function() {
				setCollectionContainerSize();
			});
			
			addCollectionWritten = false;
			latestCollectionTimestamp = getUnixTimestamp();
			$('#collectionsLoading').show();
			args.canEdit = canEdit;
			args.limit = limit;
			args.userId = userId;
			args.beforeTimestamp = getUnixTimestamp();
			args.beforeSharedTimestamp = args.beforeTimestamp;
			args.category = 'all';
			loadAllCollections();		
		}
		
		function loadAllCollections() {
			if (args.canEdit) {
				$.ajax({
	    			url: '/ajax/collection/getAllCollectionInfos.php',
	    			type: 'POST',
	    			data: {
						userId : args.userId,
						ownedBeforeTimestamp : args.beforeTimestamp,
						sharedBeforeTimestamp : args.beforeSharedTimestamp,
						limit : args.limit	
					},
	    			dataType: 'json',
	    			success: function(resp) {
						if (args.category === 'all') {
							args.beforeTimestamp = resp.ownedBeforeTimestamp;
							args.beforeSharedTimestamp = resp.sharedBeforeTimestamp;
							placeItems(resp.collections);
						}			
					},
					error: function (a, b, c) {
						
					}
				});	
			} else {
				$.ajax({
	    			url: '/ajax/collection/getAllPublicCollectionInfos.php',
	    			type: 'POST',
	    			data: {					
						userId : args.userId,
						beforeTimestamp : args.beforeTimestamp,
						limit : args.limit
					},
	    			dataType:'json',
	    			success: function(resp) {
						if (args.category === 'all') {
							args.beforeTimestamp = resp.beforeTimestamp;
							placeItems(resp.collections);
						}		
					},
					error: function (a, b, c) {
						
					}
				});
			}
		}
		
		/*
		function loadSyncCollections(beforeTimestamp) {
			$.ajax({
    			url: args.canEdit ? '/ajax/collection/getSyncCollectionInfos.php' : '/ajax/collection/getPublicSyncCollectionInfos.php',
    			type: 'POST',
    			data: { 
					userId : args.userId,
					beforeTimestamp : beforeTimestamp,
					limit : args.limit
				},
    			dataType:'json',
    			success: function(collections) {
					placeItems(collections);				
				},
				error: function (a, b, c) {
					
				}
			});				
		}
		*/
		
		function loadPrivateCollections() {
			$.ajax({
    			url: '/ajax/collection/getPrivateCollectionInfos.php',
    			type: 'POST',
    			data: { 
					userId : args.userId,
					beforeTimestamp : args.beforeTimestamp,
					limit : args.limit
				},
    			dataType:'json',
    			success: function(resp) {
					if (args.category === 'private') {
						args.beforeTimestamp = resp.beforeTimestamp;
						placeItems(resp.collections);
					}			
				},
				error: function (a, b, c) {
					
				}
			});		
		}
		
		function loadSharedCollections() {
			$.ajax({
    			url: '/ajax/collection/getSharedCollectionInfos.php',
    			type: 'POST',
    			data: { 
					userId : args.userId,
					beforeTimestamp : args.beforeSharedTimestamp,
					limit : args.limit
				},
    			dataType:'json',
    			success: function(resp) {
					if (args.category === 'shared') {
						args.beforeSharedTimestamp = resp.beforeTimestamp;
						placeItems(resp.collections);	
					}
				},
				error: function (a, b, c) {
					
				}
			});				
		}
		
		/*
		function loadSharingCollections(beforeTimestamp) {
			$.ajax({
    			url: args.canEdit ? '/ajax/collection/getSharingCollectionInfos.php' : '/ajax/collection/getPublicSharingCollectionInfos.php',
    			type: 'POST',
    			data: { 
					userId : args.userId,
					beforeTimestamp : beforeTimestamp,
					limit : args.limit
				},
    			dataType:'json',
    			success: function(collections) {
					placeItems(collections);			
				},
				error: function (a, b, c) {
					
				}
			});					
		}
		*/
		
		function clearTabs() {
			$('.collectionTabActive').removeClass('collectionTabActive');
			$('#yourCollectionTabs a').css('background-color', '');
			$('#yourCollectionTabs a').css('color', '#333');
			
			$('#yourCollectionTabAll a').css('border-top-left-radius', 5);
			$('#yourCollectionTabAll a').css('border-bottom-left-radius', 5);
			
			$('#yourCollectionTabShared a').css('border-top-right-radius', 5);
			$('#yourCollectionTabShared a').css('border-bottom-right-radius', 5);	
			
			$('#collections').remove();
			$('#wrapper').append('<div id="collections" style="display: none;" class="gridContainer"></div>');	
			$('#collectionsLoading').show();
		}
		
		function selectCollectionDefalutTab() {
			clearTabs();
			$('#userCollectionTabAll a').css('background-color', '#333').css('color', '#FFF');
			$('#userCollectionTabAll a').addClass('collectionTabActive');
			$('#userCollectionTabAll a').css('border-top-left-radius', 0);
			$('#userCollectionTabAll a').css('border-bottom-left-radius', 0);
			
			$('#yourCollectionTabAll a').css('background-color', '#333').css('color', '#FFF');
			$('#yourCollectionTabAll a').addClass('collectionTabActive');
			$('#yourCollectionTabAll a').css('border-top-left-radius', 0);
			$('#yourCollectionTabAll a').css('border-bottom-left-radius', 0);
		}				
		
		function placeItems(items) {
			var html = '';
			
			if (args.canEdit && ! addCollectionWritten) {
				html += writeAddCollection();
				addCollectionWritten = true;
			}
			
			for (var i in items) {
				if (items[i].timestamp < latestCollectionTimestamp) {
		  			html += writeItemHTML(items[i]);
					latestCollectionTimestamp = items[i].timestamp;
				}
   			}
			
			if ($('#collections').children().length > 0) {
				
				if (items.length <= 0) {
					$('#noMoreFound').show();
				} else {
        			var $moreFiles = jQuery(html);
        			$('#collections').append($moreFiles);
        			$('#collections').masonry('appended', $moreFiles);  
				}	
							
			} else {
				$('#collections').append(html);
				
				if (items.length <= 0 && ! args.canEdit) {
					$('#noCollectionsFound').show();
				}				
			}
			
			bindActions();
		}
		
	function appendCollections() {
		switch (args.category) {
			case 'all':
				loadAllCollections();
				break;
			case 'private':
				loadPrivateCollections();
				break;			
			case 'shared':
				loadSharedCollections();
				break;				
		}
	}