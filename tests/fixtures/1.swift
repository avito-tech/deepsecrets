extraParameters = decoder.decode(key: "extraParameters", fallbackValue: [:])
mapSettings = try decoder.decodeIfPresent(key: "mapSettings")
pointListRequest = RequestComponents(from: try decoder.decode(key: "pointListRequest"))
pointInfoRequest = RequestComponents(from: try decoder.decode(key: "pointInfoRequest"))
filtersInfoRequest = try decoder.decodeIfPresent(key: "filtersInfoRequest").map { RequestComponents(from: $0) }
onOpenEvent = try decoder.decodeIfPresent(key: "onOpenEvent")
onInitActions = decoder.decode(key: "onInitActions", fallbackValue: [])

let result = Unboxer(dictionary: try unboxer.unbox(key: "result"))
title = try result.unbox(key: "title")
description = result.unbox(key: "description")
actionTitle = try? result.unbox(keyPath: "actionTitle")
action = try? result.unbox(keyPath: "action")