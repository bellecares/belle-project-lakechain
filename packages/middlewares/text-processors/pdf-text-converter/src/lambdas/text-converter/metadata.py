#  Copyright (C) 2023 Amazon.com, Inc. or its affiliates.
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.

import datetime
from pdfminer.pdfdocument import PDFDocument
from time import mktime, strptime
import logging

def to_date(date_str: str) -> datetime.datetime | None:
  """
  Translates a PDF formatted date time to a Python datetime object.
  :param str: The PDF formatted date time.
  :return: A Python datetime object if the conversion
  succeeded, None otherwise.
  """
  try:
    datestring = date_str[2:-7]
    ts = strptime(datestring, "%Y%m%d%H%M%S")
    return datetime.datetime.fromtimestamp(mktime(ts))
  except ValueError:
    return None


def get_document_metadata(doc: PDFDocument, pages = 1) -> dict:
  """
  Returns the metadata of the given PDF document.
  :param doc: The PDF document.
  :return: The metadata of the given PDF document.
  """
  metadata = {
    'properties': {
      'kind': 'text',
      'attrs': {
        'pages': pages
      }
    }
  }
    
  # Iterate over the metadata and extract
  # the relevant information.
  if doc.info and len(doc.info) > 0:
    for key, value in doc.info[0].items():

      # Authors.
      if key == 'Author':
        try:
          stripped_value = value.decode('utf-8').strip()
          if len(stripped_value) > 0:
            metadata['authors'] = [author.strip() for author in stripped_value.split(';')]
        except:
          pass

      # Title.
      elif key == 'Title':
        try:
          stripped_value = value.decode('utf-8').strip()
          if len(stripped_value) > 0:
            metadata['title'] = stripped_value
        except:
          pass

      # Keywords.
      elif key == 'Keywords':
        try:
          stripped_value = value.decode('utf-8').strip()
          if len(stripped_value) > 0:
            metadata['keywords'] = [keyword.strip() for keyword in stripped_value.split(',')]
        except:
          pass

      # Creation date.
      elif key == 'CreationDate':
        try:
          date = to_date(value.decode('utf-8'))
          if date:
            metadata['createdAt'] = date.isoformat()
        except:
          pass

      # Modification date.
      elif key == 'ModDate':
        try:
          date = to_date(value.decode('utf-8'))
          if date:
            metadata['updatedAt'] = date.isoformat()
        except:
          pass

  return metadata
