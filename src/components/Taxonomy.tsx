// react
import React, { useCallback, useMemo, useEffect, useState, SyntheticEvent } from 'react'
// recoil
import { useRecoilState, useRecoilValue } from 'recoil'
// mui/material
import { colors, Typography, Button, Divider } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import SearchIcon from '@mui/icons-material/Search'
import { RichTreeView } from '@mui/x-tree-view/RichTreeView'
// fiftyone
import { registerOperator, useOperatorExecutor } from '@fiftyone/operators'
import { TaxonomyOperator } from '@/operators/TaxonomyOperator'
import * as fos from '@fiftyone/state'
// components
import { CustomTreeItem } from './CustomTreeItem'
import { SearchedImageList } from './SearchedImageList'
import { TaxonomyItem, TaxonomyData } from '@/types/type'
import styled from 'styled-components'
// etc
import httpClient from '@/utils/httpClient'
import _ from 'lodash'

const Container = styled.div`
  padding: 20px 0;
  display: flex;
  justify-content: center;
`

const DetailPanelContent = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  color: #c0c0c0;
  margin-bottom: 20px;
  height: 100%;
  width: 90%;
`

const DetailPanelContentTree = styled.div`
  position: relative;
`

const DetailPanelContentTreeBoxHeader = styled.div`
  font-size: 1.1rem;
  width: 100%;
  text-align: center;
  margin-bottom: 10px;
  border-bottom: 1px solid #c0c0c0;
`

const DetailPanelContentTreeBoxes = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  overflow-y: hidden;
`

const DetailPanelContentTreeBox = styled.div`
  width: 32.8%;
  overflow-y: hidden;
  height: calc(100vh - 320px);
`

const ActionBox = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`

const selectedNodeIds = [] as string[]
let selectedTaxonomies1 = [] as TaxonomyData[]
let selectedTaxonomies2 = [] as TaxonomyData[]
let selectedTaxonomies3 = [] as TaxonomyData[]

function Taxonomy() {
  const [treeItems1, settreeItems1] = useState([] as TaxonomyItem[])
  const [treeItems2, settreeItems2] = useState([] as TaxonomyItem[])
  const [treeItems3, settreeItems3] = useState([] as TaxonomyItem[])
  // const [expandedItems1, setExpandedItems1] = useState<string[]>([]);
  // const [expandedItems2, setExpandedItems2] = useState<string[]>([]);
  // const [expandedItems3, setExpandedItems3] = useState<string[]>([]);
  const [images, setImages] = useState([] as string[])
  const [isLoading, setIsLoading] = useState(false)
  const taxonomyExecutor = useOperatorExecutor('@voxel51/taxonomy_plugin/create_taxonomy')

  const dataset = useRecoilState(fos.dataset) as any
  const view = useRecoilValue(fos.view)
  const filters = useRecoilValue(fos.filters)

  useEffect(() => {
    ;(async () => {
      await fetchTaxonomyData()
    })()
  }, [])

  const fetchTaxonomyData = async () => {
    let items1 = [] as TaxonomyItem[]
    let items2 = [] as TaxonomyItem[]
    let items3 = [] as TaxonomyItem[]

    await taxonomyExecutor.execute({ items1, items2, items3 })
    settreeItems1(items1)
    settreeItems2(items2)
    settreeItems3(items3)
  }

  const setSourceDataTraverseTree = (selectedId: string, treeItems: TaxonomyItem[], treeId: number) => {
    selectedNodeIds.includes(selectedId) ? selectedNodeIds.splice(selectedNodeIds.indexOf(selectedId), 1) : selectedNodeIds.push(selectedId)

    const selectedSourceDatas = [] as TaxonomyData[]
    selectedNodeIds.forEach((id) => {
      function traverseTree(item: TaxonomyItem) {
        if (item.id.toString() === id) {
          selectedSourceDatas.push(item.sourceData!)
        }
        item.children?.forEach(traverseTree)
      }

      treeItems.forEach(traverseTree)
    })

    switch (treeId) {
      case 1:
        selectedTaxonomies1 = selectedSourceDatas
        break
      case 2:
        selectedTaxonomies2 = selectedSourceDatas
        break
      case 3:
        selectedTaxonomies3 = selectedSourceDatas
        break
    }
  }

  const onSelectedItemsChange1 = (event: SyntheticEvent, ids: string[]) => setSourceDataTraverseTree(ids[0], treeItems1, 1)

  const onSelectedItemsChange2 = (event: SyntheticEvent, ids: string[]) => setSourceDataTraverseTree(ids[0], treeItems2, 2)

  const onSelectedItemsChange3 = (event: SyntheticEvent, ids: string[]) => setSourceDataTraverseTree(ids[0], treeItems3, 3)

  const onClickSearch = async () => {
    setIsLoading(true)
    const concatTaxonomies = _.concat(selectedTaxonomies1, selectedTaxonomies2, selectedTaxonomies3)

    try {
      const formData = new FormData()
      formData.append('startDate', '')
      formData.append('endDate', '')
      formData.append('text', '')
      formData.append('targetTableForText', 'EmbeddedImages_v6')
      formData.append('tags', JSON.stringify(concatTaxonomies))
      formData.append('targetTableForTags', 'tag_table_EmbeddedImages_v6_Updated_NT_2')
      const response = await httpClient.post('/v1/searchByTaxonomyv2', formData)

      console.log(response.data.searchedSimilarImages)
      setImages(response.data.searchedSimilarImages)
    } finally {
      setIsLoading(false)
    }
  }

  // Test Code
  // const count = searchExecutor.result?.count || -1;
  // const onClickCount = () => {
  //   searchExecutor.execute();
  // };

  return (
    <React.StrictMode>
      <Container>
        <DetailPanelContent>
          <DetailPanelContentTree>
            <DetailPanelContentTreeBoxHeader
              style={{
                width: '200px',
                margin: '0 auto',
                textAlign: 'center',
                paddingTop: '2px',
                border: '1px solid #c0c0c0',
              }}
            >
              Driving Situation
            </DetailPanelContentTreeBoxHeader>
            <div
              style={{
                borderLeft: '1px solid #c0c0c0',
                height: '28px',
                position: 'absolute',
                left: '50%',
                top: '29px',
              }}
            ></div>
            <div
              style={{
                borderLeft: '1px solid #c0c0c0',
                height: '14px',
                position: 'absolute',
                left: '16%',
                top: '40px',
              }}
            ></div>
            <div
              style={{
                borderLeft: '1px solid #c0c0c0',
                height: '14px',
                position: 'absolute',
                left: '84%',
                top: '40px',
              }}
            ></div>
            <div
              style={{
                borderBottom: '1px solid white',
                height: '1px',
                width: '34%',
                position: 'absolute',
                left: '16%',
                top: '40px',
              }}
            ></div>
            <div
              style={{
                borderBottom: '1px solid white',
                height: '1px',
                width: '34%',
                position: 'absolute',
                left: '50%',
                top: '40px',
              }}
            ></div>
            <DetailPanelContentTreeBoxes>
              <DetailPanelContentTreeBox className="detail-panel-content-tree-box">
                <DetailPanelContentTreeBoxHeader>Scenery Elements</DetailPanelContentTreeBoxHeader>
                {treeItems1.length && (
                  <RichTreeView
                    multiSelect
                    checkboxSelection
                    items={treeItems1}
                    slots={{ item: CustomTreeItem }}
                    onSelectedItemsChange={onSelectedItemsChange1}
                  />
                )}
              </DetailPanelContentTreeBox>
              <DetailPanelContentTreeBox className="detail-panel-content-tree-box">
                <DetailPanelContentTreeBoxHeader>Environmental Condition</DetailPanelContentTreeBoxHeader>
                {treeItems2.length && (
                  <RichTreeView
                    multiSelect
                    checkboxSelection
                    items={treeItems2}
                    slots={{ item: CustomTreeItem }}
                    onSelectedItemsChange={onSelectedItemsChange2}
                  />
                )}
              </DetailPanelContentTreeBox>
              <DetailPanelContentTreeBox className="detail-panel-content-tree-box">
                <DetailPanelContentTreeBoxHeader>Dynamic Elements</DetailPanelContentTreeBoxHeader>
                {treeItems3.length && (
                  <RichTreeView
                    multiSelect
                    checkboxSelection
                    items={treeItems3}
                    slots={{ item: CustomTreeItem }}
                    onSelectedItemsChange={onSelectedItemsChange3}
                  />
                )}
              </DetailPanelContentTreeBox>
            </DetailPanelContentTreeBoxes>
          </DetailPanelContentTree>
        </DetailPanelContent>
      </Container>

      <ActionBox>
        <Button
          variant="outlined"
          startIcon={<SearchIcon />}
          style={{ width: '400px', border: '1px solid white', color: 'white', display: !isLoading ? 'inherit' : 'none' }}
          onClick={onClickSearch}
        >
          <span>Search</span>
        </Button>
        <CircularProgress style={{ display: isLoading ? 'block' : 'none' }} />
      </ActionBox>

      <Divider style={{ marginTop: '20px' }}></Divider>

      <SearchedImageList images={images}></SearchedImageList>
    </React.StrictMode>
  )
}

export default Taxonomy

registerOperator(TaxonomyOperator, '@voxel51/taxonomy_plugin')
