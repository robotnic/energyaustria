REST mit angular-nvd3 frontend. 
Die Daten werden aus diversen (copyright?) Quellen bezogen und in einer Postgres gelagert. 

# API
There is REST API to query Data.
If the Data are not available in the Database, they will be retrieved from the original source.
All data are Cached as bson postgres table.


# Data sources
There are some unstructured function to retrieve the data. Copyright is unclear.

# Todo
nodejs: split single file server to data provider and data scraper.
angular: timing and update problems
sources: check legal state of data, find new data sources

# energieaustria
