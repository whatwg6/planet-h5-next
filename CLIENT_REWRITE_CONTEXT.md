# Client Rewrite Context

## Goal

Rewrite the client business line in `planet-h5-next` so that its UI, features, and interaction behavior closely match the legacy client implementation while staying inside the current project's architecture.

## Core Boundaries

- The current project is the implementation target.
- The legacy project is a behavior reference only.
- The client business line is the rewrite scope.
- Plan and order flows are included because they are part of the current client route chain.
- Mock repositories are the only data source.
- `routeMode` is the child-page and edit-mode mechanism.

## Recommended Implementation Order

1. Fill in the H5 UI base layer:
   - `Page`
   - `NavBar`
   - `ScrollView`
   - `List`
   - `Tree`
   - `Popup` or `Sheet`
   - `Dialog`
   - `Toast`
   - `Input`
   - `Switch`
   - `Picker`
   - `SafeArea`
   - loading, error, and empty states
2. Rebuild the client domain:
   - client summary and detail
   - client settings catalog
   - department tree
   - field settings
   - login settings
   - password policy
   - cost centers
   - managers
   - notification
   - support
   - app version settings
3. Implement mutable mock repositories:
   - query client data
   - update client settings
   - create department
   - edit department
   - delete department
   - simulate save failure
4. Rewrite client pages:
   - client list
   - client detail home
   - client settings catalog
   - every client settings detail page
5. Rewrite plan flows:
   - plan detail
   - plan settings
   - both group delivery and dine-in branches
6. Rewrite order flows:
   - client order list
   - client order detail
   - price summary
   - merchant schedule information

## Required Client Route Modes

```txt
plan
setting
nameAndRemark
nameAndRemarkEdit
notification
paymentMethod
mealType
mealTypeSetting
mealGroup
manager
support
supportEdit
department
departmentEdit
costCenter
costCenterEdit
appVersion
meicanCard
externalCard
mealPoint
fieldSetting
fieldSettingDetail
loginSetting
loginSettingEmployeeNumber
loginSettingThirdParty
loginSettingThirdPartyDetail
loginSettingThirdPartyAssociateSetting
loginSettingThirdPartyMealplanSetting
passwordSetting
passwordComplexitySetting
passwordPeriodSetting
```

## Required Plan Route Modes

```txt
baseInfo
baseInfoEdit
operationDay
restriction
memberCount
openTimesDinnerIn
openTimesGroupDelivery
maximumOrderAmount
hidePrice
hidePriceAndMealPoint
disableAppendDish
hiddenAccountTypes
dishRemark
deliveryRemark
orderRule
paymentMethod
paymentMethodSelectConfig
manuallyConfirmOrder
occupationTime
orderTransfer
merchantOrderVerification
pickupSetting
pickUpMealCodeRule
menuStyle
financeConfig
financeConfigAmount
financeConfigMealType
clientMemberList
clientMemberDetail
location
```

## Glossary

- Client: An enterprise customer managed by operations.
- Meal plan: A food-service configuration unit under a client. It can be group delivery or dine-in.
- Setting item: A row in a settings catalog. It may navigate, toggle directly, display read-only state, or represent an unsupported feature.
- Settings catalog: A grouped page that lists setting items.
- Setting detail: A detail or edit page for one setting item.
- `routeMode`: Same-path page mode used instead of legacy `pageType`.
- Mutable mock: A mock data layer that supports writes and returns updated data in later reads.
- UI base layer: Business-agnostic H5 components. It must not contain client, plan, or order semantics.

## First Vertical Slice

Start with `客户设置 > 部门`.

This slice validates the most important architectural choices at once:

- domain tree model
- mutable mock repository
- `Tree` UI
- `routeMode` detail/edit flow
- create, edit, delete, and parent selection
- unsaved-change confirmation
- save failure toast behavior
- legacy behavior parity
