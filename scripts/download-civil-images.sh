#!/bin/bash

# Download Civil Engineering faculty images from ksrmce.ac.in
# URL encoding: spaces = %20

mkdir -p frontend/public/images/departments/civil/faculty/

echo "Downloading Civil Engineering faculty images..."
echo ""

# Download each image with curl
curl -s "http://ksrmce.ac.in/demo1/cedept/G%20Chenna%20Keshava%20reddy.jpg" -o frontend/public/images/departments/civil/faculty/hod.jpg
echo "Downloaded: hod.jpg"

curl -s "http://ksrmce.ac.in/demo1/cedept/Dr.%20N%20Amaranatha%20Reddy.jpg" -o frontend/public/images/departments/civil/faculty/n-amaranatha-reddy.jpg
echo "Downloaded: n-amaranatha-reddy.jpg"

curl -s "http://ksrmce.ac.in/demo1/cedept/Dr.%20V%20Giridhar.jpg" -o frontend/public/images/departments/civil/faculty/v-giridhar.jpg
echo "Downloaded: v-giridhar.jpg"

curl -s "http://ksrmce.ac.in/demo1/cedept/Dr.%20M%20V%20Ravi%20Kishore%20Reddy.jpg" -o frontend/public/images/departments/civil/faculty/mv-ravi-kishore-reddy.jpg
echo "Downloaded: mv-ravi-kishore-reddy.jpg"

curl -s "http://ksrmce.ac.in/demo1/cedept/I%20Srinivasula%20Reddy.jpg" -o frontend/public/images/departments/civil/faculty/i-srinivasula-reddy.jpg
echo "Downloaded: i-srinivasula-reddy.jpg"

curl -s "http://ksrmce.ac.in/demo1/cedept/P%20Suresh%20Praveen%20Kumar.jpg" -o frontend/public/images/departments/civil/faculty/p-suresh-praveen-kumar.jpg
echo "Downloaded: p-suresh-praveen-kumar.jpg"

curl -s "http://ksrmce.ac.in/demo1/cedept/P%20Rajendra%20Kumar.jpg" -o frontend/public/images/departments/civil/faculty/p-rajendra-kumar.jpg
echo "Downloaded: p-rajendra-kumar.jpg"

curl -s "http://ksrmce.ac.in/demo1/cedept/K.%20Niveditha.jpg" -o frontend/public/images/departments/civil/faculty/k-niveditha.jpg
echo "Downloaded: k-niveditha.jpg"

curl -s "http://ksrmce.ac.in/demo1/cedept/D%20Viswanath.jpg" -o frontend/public/images/departments/civil/faculty/d-viswanath.jpg
echo "Downloaded: d-viswanath.jpg"

curl -s "http://ksrmce.ac.in/demo1/cedept/M%20Vijaya%20Kumar.jpg" -o frontend/public/images/departments/civil/faculty/m-vijaya-kumar.jpg
echo "Downloaded: m-vijaya-kumar.jpg"

curl -s "http://ksrmce.ac.in/demo1/cedept/K%20Hemanth%20Kumar%20Reddy.jpg" -o frontend/public/images/departments/civil/faculty/k-hemanth-kumar-reddy.jpg
echo "Downloaded: k-hemanth-kumar-reddy.jpg"

curl -s "http://ksrmce.ac.in/demo1/cedept/G%20Chenna%20Keshava%20reddy.jpg" -o frontend/public/images/departments/civil/faculty/g-chennakesava-reddy.jpg
echo "Downloaded: g-chennakesava-reddy.jpg"

curl -s "http://ksrmce.ac.in/demo1/cedept/P%20Pavan%20kumar.jpg" -o frontend/public/images/departments/civil/faculty/p-pavan-kumar.jpg
echo "Downloaded: p-pavan-kumar.jpg"

curl -s "http://ksrmce.ac.in/demo1/cedept/Y%20Dastagir.jpg" -o frontend/public/images/departments/civil/faculty/y-dastagiri.jpg
echo "Downloaded: y-dastagiri.jpg"

curl -s "http://ksrmce.ac.in/demo1/cedept/V%20Venkata%20Subbamma.jpg" -o frontend/public/images/departments/civil/faculty/v-venkata-subbamma.jpg
echo "Downloaded: v-venkata-subbamma.jpg"

curl -s "http://ksrmce.ac.in/demo1/cedept/Dr.%20K%20Shaikshavalli.jpg" -o frontend/public/images/departments/civil/faculty/k-shaiksha-vali.jpg
echo "Downloaded: k-shaiksha-vali.jpg"

echo ""
echo "Download complete! Checking file sizes..."
echo ""
