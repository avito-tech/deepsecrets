const result3 = reducer(result2, changeObjectPageDraftFilters({
    key: 'id-3',
    value: '789'
}));

var PDFRenderingQueue = function () {
  
    _createClass(PDFRenderingQueue, [{
      key: "setViewer",
      value: function setViewer(pdfViewer) {
        this.pdfViewer = pdfViewer;
      }
    }, {
      key: "setThumbnailViewer",
      value: function setThumbnailViewer(pdfThumbnailViewer) {
        this.pdfThumbnailViewer = pdfThumbnailViewer;
      }
    }, {
      key: "isHighestPriority",
      value: function isHighestPriority(view) {
        return this.highestPriorityPage === view.renderingId;
      }
    }, {
      key: "renderHighestPriority",
      value: function renderHighestPriority(currentlyVisiblePages) {
        if (this.idleTimeout) {
          clearTimeout(this.idleTimeout);
          this.idleTimeout = null;
        }
        if (this.pdfViewer.forceRendering(currentlyVisiblePages)) {
          return;
        }
        if (this.pdfThumbnailViewer && this.isThumbnailViewEnabled) {
          if (this.pdfThumbnailViewer.forceRendering()) {
            return;
          }
        }
        if (this.printing) {
          return;
        }
        if (this.onIdle) {
          this.idleTimeout = setTimeout(this.onIdle.bind(this), CLEANUP_TIMEOUT);
        }
      }
    }, {
      key: "getHighestPriority",
      value: function getHighestPriority(visible, views, scrolledDown) {
        var visibleViews = visible.views;
        var numVisible = visibleViews.length;
        if (numVisible === 0) {
          return false;
        }
        for (var i = 0; i < numVisible; ++i) {
          var view = visibleViews[i].view;
          if (!this.isViewFinished(view)) {
            return view;
          }
        }
        if (scrolledDown) {
          var nextPageIndex = visible.last.id;
          if (views[nextPageIndex] && !this.isViewFinished(views[nextPageIndex])) {
            return views[nextPageIndex];
          }
        } else {
          var previousPageIndex = visible.first.id - 2;
          if (views[previousPageIndex] && !this.isViewFinished(views[previousPageIndex])) {
            return views[previousPageIndex];
          }
        }
        return null;
      }
    }, {
      key: "isViewFinished",
      value: function isViewFinished(view) {
        return view.renderingState === RenderingStates.FINISHED;
      }
    }, {
      key: "renderView",
      value: function renderView(view) {
        var _this = this;
  
        switch (view.renderingState) {
          case RenderingStates.FINISHED:
            return false;
          case RenderingStates.PAUSED:
            this.highestPriorityPage = view.renderingId;
            view.resume();
            break;
          case RenderingStates.RUNNING:
            this.highestPriorityPage = view.renderingId;
            break;
          case RenderingStates.INITIAL:
            this.highestPriorityPage = view.renderingId;
            var continueRendering = function continueRendering() {
              _this.renderHighestPriority();
            };
            view.draw().then(continueRendering, continueRendering);
            break;
        }
        return true;
      }
    }]);
  
    return PDFRenderingQueue;
  }();
  