window.exampleCode = {
    "profile": {
        "fail": false,
        "timeout": false,
        "startTime": 1579499014279,
        "finishTime": 1579499015133,
        "totalTime": 854
    },
    "metadata": {
        "result": "object",
        "errorMessage": null
    },
    "template": [
        {
            "name": "getWeather",
            "logs": {
                "b6d9d11f-f390-4861-9aab-169a540397ce": {
                    "logs": {
                        "51aadc3d-1ff9-4fb0-87db-2ad5da35bd6e": {
                            "logs": {
                                "15267bb7-be7e-47cc-a35e-d305a01f14ac": {
                                    "logs": {},
                                    "caller": "51aadc3d-1ff9-4fb0-87db-2ad5da35bd6e",
                                    "startTime": 1579499014396,
                                    "name": "getData",
                                    "args": [],
                                    "mode": "action",
                                    "info": null,
                                    "request": "[]",
                                    "response": null,
                                    "group": {
                                        "name": "weather",
                                        "sign": "OpenData"
                                    },
                                    "result": "object",
                                    "success": true,
                                    "finishTime": 1579499014872,
                                    "totalTime": 476
                                }
                            },
                            "caller": "b6d9d11f-f390-4861-9aab-169a540397ce",
                            "startTime": 1579499014396,
                            "name": "getLocalByNearGeo",
                            "args": [
                                0,
                                0
                            ],
                            "mode": "action",
                            "info": null,
                            "request": "[\"number\",\"number\"]",
                            "response": "location",
                            "group": {
                                "name": "weather",
                                "sign": "OpenData"
                            },
                            "result": "object",
                            "success": true,
                            "finishTime": 1579499014873,
                            "totalTime": 477
                        }
                    },
                    "caller": null,
                    "startTime": 1579499014395,
                    "name": "getWeather",
                    "args": [
                        0,
                        0
                    ],
                    "mode": "action",
                    "info": null,
                    "request": "[\"number\",\"number\"]",
                    "response": null,
                    "group": {
                        "name": "Local",
                        "sign": ""
                    },
                    "result": "object",
                    "success": true,
                    "finishTime": 1579499014873,
                    "totalTime": 478
                }
            },
            "startTime": 1579499014280,
            "finishTime": 1579499014873,
            "totalTime": 593
        },
        {
            "name": "getRainfall",
            "logs": {
                "cddc3711-cb92-4534-95e1-569f4a6e46ad": {
                    "logs": {
                        "cafac7cf-f4a8-4fb5-b736-4a96c7c33b33": {
                            "logs": {
                                "c684db82-517f-493e-8da4-2b53ba37e2a3": {
                                    "logs": {},
                                    "caller": "cafac7cf-f4a8-4fb5-b736-4a96c7c33b33",
                                    "startTime": 1579499014875,
                                    "name": "getData",
                                    "args": [],
                                    "mode": "action",
                                    "info": null,
                                    "request": "[]",
                                    "response": null,
                                    "group": {
                                        "name": "rainfall",
                                        "sign": "OpenData"
                                    },
                                    "result": "object",
                                    "success": true,
                                    "finishTime": 1579499015132,
                                    "totalTime": 257
                                }
                            },
                            "caller": "cddc3711-cb92-4534-95e1-569f4a6e46ad",
                            "startTime": 1579499014875,
                            "name": "getLocalByNearGeo",
                            "args": [
                                0,
                                0
                            ],
                            "mode": "action",
                            "info": null,
                            "request": "[\"number\",\"number\"]",
                            "response": "location",
                            "group": {
                                "name": "rainfall",
                                "sign": "OpenData"
                            },
                            "result": "object",
                            "success": true,
                            "finishTime": 1579499015132,
                            "totalTime": 257
                        }
                    },
                    "caller": null,
                    "startTime": 1579499014875,
                    "name": "getRainfall",
                    "args": [
                        0,
                        0
                    ],
                    "mode": "action",
                    "info": null,
                    "request": "[\"number\",\"number\"]",
                    "response": null,
                    "group": {
                        "name": "Local",
                        "sign": ""
                    },
                    "result": "object",
                    "success": true,
                    "finishTime": 1579499015132,
                    "totalTime": 257
                }
            },
            "startTime": 1579499014874,
            "finishTime": 1579499015132,
            "totalTime": 258
        }
    ]
}
