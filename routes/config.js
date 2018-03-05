exports.loadBalanceMappings = {
    'Mobile': {
        'lessThan30': {
            'clientRenderPercentage': 60,
            'serverRenderPercentage': 40
        },
        'between30And40': {
            'clientRenderPercentage': 40,
            'serverRenderPercentage': 60
        },
        'greaterThan40': {
            'clientRenderPercentage': 20,
            'serverRenderPercentage': 80
        }
    },
    'Desktop': {
        'lessThan30': {
            'clientRenderPercentage': 70,
            'serverRenderPercentage': 30
        },
        'between30And40': {
            'clientRenderPercentage': 50,
            'serverRenderPercentage': 50
        },
        'greaterThan40': {
            'clientRenderPercentage': 30,
            'serverRenderPercentage': 70
        }
    }
};